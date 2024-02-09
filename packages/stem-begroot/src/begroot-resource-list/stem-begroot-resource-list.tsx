import React from 'react';
import {
  Image,
  List,
  PlainButton,
  SecondaryButton,
  Spacer,
} from '@openstad-headless/ui/src';

import { elipsize } from '@openstad-headless/lib/ui-helpers';


export const StemBegrootResourceList = ({
    resources,
    selectedResources,
    onResourcePlainClicked,
    onResourcePrimaryClicked,
    maxBudget,
    budgetUsed
  }: {
    resources:Array<any>,
    selectedResources: Array<any>,
    onResourcePlainClicked: (resource:any, index:number) => void,
    onResourcePrimaryClicked: (resource:any) => void,
    maxBudget:number,
    budgetUsed:number
  }) => {

    return <List
          columns={3}
          items={resources || []}
          renderHeader={() => (
            <>
              <h3>Plannen</h3> <Spacer size={1} />
            </>
          )}
          renderItem={(resource, index) => {
            const btnPrimaryText = selectedResources.find(
              (r) => r.id === resource.id
            )
              ? 'Verwijder'
              : 'Voeg toe';

            const theme = resource.tags
              ?.filter((t: any) => t.type === 'theme')
              ?.at(0);
            const area = resource.tags
              ?.filter((t: any) => t.type === 'area')
              ?.at(0);
            return (
              <>
                <article>
                  <Image src={resource.images?.at(0)?.src || ''} />

                  <div>
                    <Spacer size={1} />
                    <section className="stembegroot-content-item-header">
                      <h5>&euro;{resource.budget || 0}</h5>

                      <div className="stembegroot-content-item-header-taglist">
                        <p className="strong">Thema:</p>
                        <p>{theme?.name || 'Geen thema'}</p>
                        <p className="strong">Gebied:</p>
                        <p> {area?.name || 'Geen gebied'}</p>
                      </div>
                    </section>

                    <Spacer size={0.5} />

                    <p>{elipsize(resource.description, 200)}</p>

                    <Spacer size={1} />
                  </div>

                  <div className="osc-stem-begroot-content-item-footer">
                    <PlainButton
                      className="osc-stem-begroot-item-action-btn"
                      onClick={() => {
                        onResourcePlainClicked(resource, index)
                      }}>
                      Lees meer
                    </PlainButton>
                    <SecondaryButton
                      disabled={
                        !selectedResources.find((r) => r.id === resource.id) &&
                        !(resource.budget < maxBudget - budgetUsed)
                      }
                      className="osc-stem-begroot-item-action-btn"
                      onClick={() => {
                        onResourcePrimaryClicked(resource);
                      }}>
                      {btnPrimaryText}
                    </SecondaryButton>
                  </div>
                </article>
              </>
            );
          }}
        />
}
