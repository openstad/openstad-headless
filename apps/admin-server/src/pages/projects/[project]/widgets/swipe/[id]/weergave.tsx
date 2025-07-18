import React, { ReactNode } from 'react';
import {
  Form,
} from '../../../../../../components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Heading } from '@/components/ui/typography';
import { Separator } from '@/components/ui/separator';
import { SwipeWidgetProps } from '@openstad-headless/swipe/src/swipe';
import { EditFieldProps } from '@/lib/form-widget-helpers/EditFieldProps';
import { useFieldDebounce } from '@/hooks/useFieldDebounce';
import { ObjectListSelect } from '@/components/ui/object-select';
import useResources from '@/hooks/use-resources';
import { FormObjectSelectField } from '@/components/ui/form-object-select-field';
import {undefinedToTrueOrProp, YesNoSelect} from '@/lib/form-widget-helpers';
import { SwipeWidgetTabProps } from '.';
import * as Switch from '@radix-ui/react-switch';

const formSchema = z.object({

});
type FormData = z.infer<typeof formSchema>;
type SchemaKey = keyof FormData;

export default function SwipeDisplay({
  omitSchemaKeys = [],
  ...props
}: SwipeWidgetTabProps &
  EditFieldProps<SwipeWidgetTabProps> & {
    omitSchemaKeys?: Array<SchemaKey>;
  }) {
  const finalSchema = formSchema.omit(
    omitSchemaKeys.reduce(
      (prev, key) => Object.assign(prev, { [key]: true }),
      {}
    )
  );

  type FinalSchemaInfer = z.infer<typeof finalSchema>;

  const conditionallyRenderField = (key: SchemaKey, field: ReactNode) => {
    return key in finalSchema.shape ? field : null;
  };

  const { onFieldChange } = useFieldDebounce(props.onFieldChanged);
  const { data, error } = useResources(props.projectId);
  // Force at least minimal typehinting
  const resources: Array<{ id: string | number; title: string }> = data || [];

  function onSubmit(values: FinalSchemaInfer) {
    props.updateConfig({ ...props, ...values });
  }

  const form = useForm<FinalSchemaInfer>({
    resolver: zodResolver<any>(finalSchema),
    defaultValues: {
      resourceId: props?.resourceId,
    },
  });

  return (
    <Form {...form} className="p-6 bg-white rounded-md">
      <Heading size="xl" className="mb-4">
        Instellingen
      </Heading>
      <Separator className="mb-4" />
    </Form>
  );
}
