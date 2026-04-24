import ColorPicker from '@/components/colorpicker';
import { ImageUploader } from '@/components/image-uploader';
import MapClickHandler from '@/components/maps/map-click-handler';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Heading } from '@/components/ui/typography';
import useUnsavedChanges from '@/hooks/use-unsaved-changes';
import { zodResolver } from '@hookform/resolvers/zod';
import 'leaflet/dist/leaflet.css';
import { ArrowLeft, MapPin, Trash2, X } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const markerSchema = z.object({
  lat: z.number(),
  lng: z.number(),
  title: z.string().optional().default(''),
  description: z.string().optional().default(''),
  color: z.string().optional().default('#555588'),
  icon: z.string().optional().default(''),
  iconUploader: z.string().optional(),
  url: z.string().optional().default(''),
  openInNewTab: z.boolean().optional().default(false),
  buttonText: z.string().optional().default(''),
});

export type Marker = z.infer<typeof markerSchema>;

interface LeafletComponents {
  MapContainer: React.ComponentType<any>;
  TileLayer: React.ComponentType<any>;
  Marker: React.ComponentType<any>;
  useMapEvents: (events: { [key: string]: (e: any) => void }) => void;
}

interface MarkersEditorProps {
  initialName: string;
  initialMarkers: Marker[];
  project: string;
  onSave: (name: string, markers: Marker[]) => Promise<void>;
  isSaving?: boolean;
}

export default function MarkersEditor({
  initialName,
  initialMarkers,
  project,
  onSave,
  isSaving = false,
}: MarkersEditorProps) {
  const [markers, setMarkers] = useState<Marker[]>(initialMarkers);
  const [activeMarkerIndex, setActiveMarkerIndex] = useState<number | null>(
    null
  );
  const [isSSR, setIsSSR] = useState(true);
  const [leafletComponents, setLeafletComponents] =
    useState<LeafletComponents | null>(null);
  const [leafletLib, setLeafletLib] = useState<any>(null);
  const [markerIconFn, setMarkerIconFn] = useState<any>(null);
  const [skipNextMapClick, setSkipNextMapClick] = useState(false);

  const { setSavedState, getCurrentStateRef } = useUnsavedChanges();

  const nameForm = useForm<{ name: string }>({
    resolver: zodResolver<any>(
      z.object({ name: z.string().min(1, 'Naam is verplicht') })
    ),
    defaultValues: { name: initialName },
  });

  const markerForm = useForm<Marker>({
    resolver: zodResolver<any>(markerSchema),
    defaultValues: {
      lat: 0,
      lng: 0,
      title: '',
      description: '',
      color: '#555588',
      icon: '',
      url: '',
      openInNewTab: false,
      buttonText: '',
    },
  });

  const watchedColor = markerForm.watch('color');
  const watchedIcon = markerForm.watch('icon');

  useEffect(() => {
    setMarkers(initialMarkers);
    nameForm.reset({ name: initialName });
    setSavedState({ name: initialName, markers: initialMarkers });
  }, [initialName, initialMarkers]);

  function getFullState() {
    const currentMarkers = [...markers];
    if (activeMarkerIndex !== null) {
      currentMarkers[activeMarkerIndex] = getMarkerFormValues();
    }
    return { name: nameForm.getValues('name'), markers: currentMarkers };
  }

  getCurrentStateRef.current = getFullState;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsSSR(false);
      import('react-leaflet')
        .then((leaflet) => setLeafletComponents(leaflet))
        .catch((error) => console.error('Failed to load react-leaflet', error));

      import('leaflet').then((L) => {
        setLeafletLib(L);
        import('@openstad-headless/leaflet-map/src/marker-icon').then(
          (module) => {
            setMarkerIconFn(() => module.default);
          }
        );
      });
    }
  }, []);

  useEffect(() => {
    if (activeMarkerIndex !== null && markers[activeMarkerIndex]) {
      markerForm.reset(markers[activeMarkerIndex]);
    }
  }, [activeMarkerIndex]);

  function getMarkerFormValues(): Marker {
    const { iconUploader, ...values } = markerForm.getValues();
    return values;
  }

  function applyMarkerFormToState() {
    if (activeMarkerIndex === null) return;
    const updated = [...markers];
    updated[activeMarkerIndex] = getMarkerFormValues();
    setMarkers(updated);
  }

  function switchToMarker(index: number | null) {
    if (index === activeMarkerIndex) return;
    if (activeMarkerIndex !== null) {
      applyMarkerFormToState();
    }
    setActiveMarkerIndex(index);
  }

  const createMarkerIcon = useCallback(
    (marker: Marker, isActive: boolean) => {
      if (!markerIconFn || !leafletLib) return undefined;

      if (marker.icon) {
        return leafletLib.icon({
          iconUrl: marker.icon,
          iconSize: [30, 40],
          iconAnchor: [15, 40],
          className: isActive
            ? 'custom-image-icon marker-active-highlight'
            : 'custom-image-icon',
        });
      }

      const color = marker.color || '#555588';
      const icon = markerIconFn({ icon: { color } });

      if (isActive && icon?.options) {
        return leafletLib.divIcon({
          ...icon.options,
          className: [icon.options.className || '', 'marker-active-highlight']
            .filter(Boolean)
            .join(' '),
        });
      }

      return icon;
    },
    [markerIconFn, leafletLib]
  );

  function getDisplayMarker(marker: Marker, index: number): Marker {
    if (index === activeMarkerIndex) {
      return {
        ...marker,
        color: watchedColor !== undefined ? watchedColor : marker.color,
        icon: watchedIcon !== undefined ? watchedIcon : marker.icon,
      };
    }
    return marker;
  }

  function handleMapClick(latlng: { lat: number; lng: number }) {
    if (skipNextMapClick) {
      setSkipNextMapClick(false);
      return;
    }

    if (activeMarkerIndex !== null) {
      applyMarkerFormToState();
    }

    const newMarker: Marker = {
      lat: latlng.lat,
      lng: latlng.lng,
      title: '',
      description: '',
      color: '#555588',
      icon: '',
      url: '',
      openInNewTab: false,
      buttonText: '',
    };
    const updated = [...markers, newMarker];
    setMarkers(updated);

    setActiveMarkerIndex(updated.length - 1);
  }

  function handleMarkerDelete(index: number) {
    const updated = markers.filter((_, i) => i !== index);
    setMarkers(updated);

    if (activeMarkerIndex === index) {
      setActiveMarkerIndex(null);
    } else if (activeMarkerIndex !== null && activeMarkerIndex > index) {
      setActiveMarkerIndex(activeMarkerIndex - 1);
    }
  }

  async function handleSave() {
    const isValid = await nameForm.trigger();
    if (!isValid) return;

    const { name, markers: currentMarkers } = getFullState();
    await onSave(name, currentMarkers);
    setSavedState({ name, markers: currentMarkers });
  }

  return (
    <>
      <style>{`
        .marker-active-highlight {
          filter: drop-shadow(0 0 6px rgba(59, 130, 246, 0.8)) drop-shadow(0 0 12px rgba(59, 130, 246, 0.5));
        }
      `}</style>
      <div className="p-6 bg-white rounded-md">
        <Form {...nameForm}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-4 gap-y-8 mb-6">
            <FormField
              control={nameForm.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Naam</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Naam van de markers"
                      onChange={(e) => {
                        field.onChange(e);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </Form>

        <Separator className="my-4" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <Heading size="lg" className="mb-4">
              Klik op de kaart om een marker te plaatsen
            </Heading>
            {isSSR || !leafletComponents ? (
              <div
                style={{ height: '500px', width: '100%' }}
                className="bg-gray-100 flex items-center justify-center">
                Kaart is aan het laden...
              </div>
            ) : (
              <leafletComponents.MapContainer
                center={{ lat: 52.129507, lng: 4.670647 }}
                zoom={7}
                scrollWheelZoom={true}
                style={{ height: '500px', width: '100%' }}>
                <leafletComponents.TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                {markers.map((marker, index) => {
                  const display = getDisplayMarker(marker, index);
                  const isActive = index === activeMarkerIndex;
                  const icon = createMarkerIcon(display, isActive);
                  if (!icon) return null;

                  return (
                    <leafletComponents.Marker
                      key={`${index}-${marker.lat}-${marker.lng}-${display.color}-${display.icon}`}
                      position={{ lat: marker.lat, lng: marker.lng }}
                      icon={icon}
                      eventHandlers={{
                        click: () => {
                          setSkipNextMapClick(true);
                          switchToMarker(index);
                        },
                      }}
                    />
                  );
                })}
                <MapClickHandler
                  useMapEvents={leafletComponents.useMapEvents}
                  onMapClick={handleMapClick}
                />
              </leafletComponents.MapContainer>
            )}
          </div>

          <div className="overflow-y-auto" style={{ maxHeight: '500px' }}>
            {activeMarkerIndex !== null && markers[activeMarkerIndex] ? (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => switchToMarker(null)}>
                    <ArrowLeft size={16} />
                    Terug naar lijst
                  </Button>
                </div>
                <Heading size="lg" className="mb-4">
                  Marker bewerken
                </Heading>
                <Form {...markerForm}>
                  <form
                    onSubmit={(e) => e.preventDefault()}
                    className="space-y-4">
                    <FormField
                      control={markerForm.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Titel</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Titel" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={markerForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Beschrijving</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              rows={3}
                              placeholder="Beschrijving"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={markerForm.control}
                      name="color"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Kleur</FormLabel>
                          <FormControl>
                            <ColorPicker
                              value={field.value || '#555588'}
                              onChange={(e) => field.onChange(e.target.value)}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={markerForm.control}
                      name="icon"
                      render={({ field }) => {
                        const usedIcons = Array.from(
                          new Set(
                            markers
                              .map((m) => m.icon)
                              .filter((url) => url && url !== field.value)
                          )
                        );

                        return (
                          <FormItem>
                            <FormLabel>Icoon</FormLabel>
                            <FormControl>
                              <div>
                                {usedIcons.length > 0 && (
                                  <div className="mb-3">
                                    <p className="text-sm text-muted-foreground mb-2">
                                      Gebruikt in deze set:
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                      {usedIcons.map((url) => (
                                        <button
                                          key={url}
                                          type="button"
                                          className={`p-1 rounded border-2 transition-colors ${
                                            field.value === url
                                              ? 'border-blue-500 bg-blue-50'
                                              : 'border-gray-200 hover:border-gray-400'
                                          }`}
                                          onClick={() =>
                                            markerForm.setValue('icon', url)
                                          }>
                                          <img
                                            src={url}
                                            alt=""
                                            className="h-8 w-8 object-contain"
                                          />
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                <ImageUploader
                                  form={markerForm}
                                  project={project}
                                  imageLabel="Upload een nieuw icoon"
                                  fieldName="iconUploader"
                                  allowedTypes={['image/*']}
                                  onImageUploaded={(imageResult) => {
                                    const result =
                                      typeof imageResult.url !== 'undefined'
                                        ? imageResult.url
                                        : '';
                                    markerForm.setValue('icon', result);
                                    markerForm.resetField('iconUploader');
                                  }}
                                />
                                {field.value && (
                                  <div className="mt-2 flex items-center gap-2">
                                    <img
                                      src={field.value}
                                      alt="Marker icoon"
                                      className="h-10 w-10 object-contain"
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        markerForm.setValue('icon', '')
                                      }>
                                      <X size={16} />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </FormControl>
                          </FormItem>
                        );
                      }}
                    />
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <FormField
                        control={markerForm.control}
                        name="url"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>URL</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="https://..."
                                type="text"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={markerForm.control}
                        name="buttonText"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Knoptekst</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Lees verder"
                                type="text"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={markerForm.control}
                      name="openInNewTab"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel>Open in nieuw tabblad</FormLabel>
                        </FormItem>
                      )}
                    />

                    <div className="flex gap-2 pt-4">
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => handleMarkerDelete(activeMarkerIndex)}>
                        <Trash2 size={16} className="mr-1" />
                        Verwijderen
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            ) : (
              <div>
                <Heading size="lg" className="mb-4">
                  Markers ({markers.length})
                </Heading>
                {markers.length === 0 ? (
                  <p className="text-muted-foreground">
                    Nog geen markers. Klik op de kaart om een marker toe te
                    voegen.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {markers.map((marker, index) => (
                      <li
                        key={`${index}-${marker.lat}-${marker.lng}`}
                        className={`flex items-center justify-between p-3 rounded-md border cursor-pointer transition-colors ${
                          index === activeMarkerIndex
                            ? 'bg-blue-50 border-blue-300'
                            : 'hover:bg-muted'
                        }`}
                        onClick={() => switchToMarker(index)}>
                        <div className="flex items-center gap-3">
                          {marker.icon ? (
                            <img
                              src={marker.icon}
                              alt=""
                              className="h-6 w-6 object-contain"
                            />
                          ) : (
                            <MapPin
                              size={20}
                              style={{ color: marker.color || '#555588' }}
                            />
                          )}
                          <div>
                            <p className="font-medium">
                              {marker.title || `Marker ${index + 1}`}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {marker.lat.toFixed(5)}, {marker.lng.toFixed(5)}
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkerDelete(index);
                          }}>
                          <Trash2 size={16} />
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>

        <Separator className="my-4" />

        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Opslaan...' : 'Opslaan'}
        </Button>
      </div>
    </>
  );
}
