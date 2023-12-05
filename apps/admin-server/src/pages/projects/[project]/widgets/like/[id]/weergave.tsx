import React, { useEffect } from 'react';
import { Button } from '../../../../../../components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '../../../../../../components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../../../components/ui/select';
import { Input } from '../../../../../../components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Heading } from '@/components/ui/typography';
import { Separator } from '@/components/ui/separator';

const formSchema = z.object({
  display: z.string(),
  yesLabel: z.string(),
  noLabel: z.string(),
});
type FormData = z.infer<typeof formSchema>;

type LikeProps = {
  like?: {
    display?: string;
    yesLabel?: string;
    noLabel?: string;
  };
};

type LikeDisplayProps = {
  config?: LikeProps;
  updateConfig: (like: LikeProps) => void;
  onFieldChanged: (key: string, value: string) => void;
};

export default function LikesDisplay(props: LikeDisplayProps) {
  const defaults = () => ({
    display: props?.config?.like?.display,
    yesLabel: props?.config?.like?.yesLabel,
    noLabel: props?.config?.like?.noLabel,
  });

  function onSubmit(values: FormData) {
    props.updateConfig({ like: values });
  }

  const form = useForm<FormData>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: defaults(),
  });

  useEffect(() => {
    form.reset(defaults());
  }, [props]);

  return (
    <Form {...form} className="p-6 bg-white rounded-md">
      <Heading size="xl" className="mb-4">
        Instellingen
      </Heading>
      <Separator className="mb-4" />
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 lg:w-1/2">
        <FormField
          control={form.control}
          name="display"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Weergave type</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                }}
                value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Claps" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="claps">Claps</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="yesLabel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Label voor "Ja"</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    props.onFieldChanged('yesLabel', e.target.value);
                  }}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="noLabel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Label voor "Nee"</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    props.onFieldChanged('noLabel', e.target.value);
                  }}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <Button type="submit">Opslaan</Button>
      </form>
    </Form>
  );
}
