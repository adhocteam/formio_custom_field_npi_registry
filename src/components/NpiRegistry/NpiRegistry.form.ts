import nestedComponentForm from 'formiojs/components/_classes/nested/NestedComponent.form';
import NpiRegistryEditDisplay from './editForm/NpiRegistry.edit.display';
export default function(...extend) {
  return nestedComponentForm([
    {
      key: 'display',
      components: NpiRegistryEditDisplay
    }
  ], ...extend);
}
