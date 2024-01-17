import {
  AbstractControl,
  UntypedFormArray,
  UntypedFormControl,
  UntypedFormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { V1PersistentVolumeClaim, V1Volume } from '@kubernetes/client-node';
import { EXISTING_SOURCE, Volume } from 'src/app/types';

/*
 * Form Group helpers
 */
export function setGenerateNameCtrl(meta: UntypedFormGroup, name = '') {
  if (meta.get('generateName')) {
    if (name) {
      meta.get('generateName').setValue(name);
    }

    return;
  }

  // remove the name control, if it exists, but carry over its value
  if (meta.get('name')) {
    if (!name) {
      name = meta.get('name').value;
    }

    meta.removeControl('name');
  }

  meta.addControl(
    'generateName',
    new UntypedFormControl(name, [Validators.required]),
  );
}

// For volume.existingSource
export function createSourceFormGroup(
  source: EXISTING_SOURCE,
): AbstractControl {
  switch (source) {
    case EXISTING_SOURCE.PERSISTENT_VOLUME_CLAIM: {
      return createPvcFormGroup();
    }
    default: {
      return createGenericSourceFormGroup(source);
    }
  }
}

// For volume.existingSource
// In this case the user will type a yaml to fill the spec
export function createGenericSourceFormGroup(
  source: EXISTING_SOURCE,
): AbstractControl {
  return new UntypedFormControl('', []);
}

// for volume.existingSource.persistentVolumeClaim
export function createPvcFormGroup(): UntypedFormGroup {
  return new UntypedFormGroup({
    readOnly: new UntypedFormControl(false, []),
    claimName: new UntypedFormControl('', [Validators.required]),
  });
}

// for volume.existingSource
export function createExistingSourceFormGroup(): UntypedFormGroup {
  return new UntypedFormGroup({
    persistentVolumeClaim: createPvcFormGroup(),
  });
}

// for volume.newPvc
export function createNewPvcFormGroup(
  name = '{notebook-name}-volume',
): UntypedFormGroup {
  return new UntypedFormGroup({
    metadata: new UntypedFormGroup({
      name: new UntypedFormControl(name, Validators.required),
    }),
    spec: new UntypedFormGroup({
      accessModes: new UntypedFormControl(['ReadWriteOnce']),
      resources: new UntypedFormGroup({
        requests: new UntypedFormGroup({
          storage: new UntypedFormControl('16Gi', []), //AAW change, do not remove
        }),
      }),
      storageClassName: new UntypedFormControl({
        value: '',
        disabled: true,
      }),
    }),
  });
}

function duplicateMountPathValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control.value) {
      const formArray = control.parent
        ? (control.parent.parent as UntypedFormArray)
        : null;

      if (formArray) {
        const hasWorkspaceVol =
          formArray.parent.get('workspace').value.newPvc ||
          formArray.parent.get('workspace').value.existingSource
            ? true
            : false;

        if (hasWorkspaceVol && control.value === '/home/jovyan') {
          return { duplicate: true };
        }

        const mounts = formArray.value.map(e => e.mount);
        const indexOf = mounts.indexOf(control.value);
        return indexOf >= 0 && indexOf < mounts.lastIndexOf(control.value)
          ? { duplicate: true }
          : null;
      }
    }
  };
}

// For volume
export function createNewPvcVolumeFormGroup(
  name = '{notebook-name}-volume',
): UntypedFormGroup {
  return new UntypedFormGroup({
    name: new UntypedFormControl('', []),
    mount: new UntypedFormControl('', [
      Validators.required,
      Validators.pattern(
        /^(((\/home\/jovyan)((\/)(.)*)?)|((\/opt\/openmpp)((\/)(.)*)?))$/,
      ),
      duplicateMountPathValidator(),
    ]),
    newPvc: createNewPvcFormGroup(name),
  });
}

// For volume
export function createExistingVolumeFormGroup(): UntypedFormGroup {
  return new UntypedFormGroup({
    name: new UntypedFormControl('', []),
    mount: new UntypedFormControl('', [
      Validators.required,
      Validators.pattern(
        /^(((\/home\/jovyan)((\/)(.)*)?)|((\/opt\/openmpp)((\/)(.)*)?))$/,
      ),
      duplicateMountPathValidator(),
    ]),
    existingSource: createExistingSourceFormGroup(),
  });
}

/*
 * Create Form Groups from JS ojects
 */
export function createMetadataFormGroupFromPvc(
  pvc: V1PersistentVolumeClaim,
): UntypedFormGroup {
  const metadata = pvc.metadata;

  const group = new UntypedFormGroup({});

  if (metadata.name) {
    group.addControl(
      'name',
      new UntypedFormControl(metadata.name, Validators.required),
    );
  }

  if (metadata.generateName) {
    group.addControl(
      'generateName',
      new UntypedFormControl(metadata.generateName, Validators.required),
    );
  }

  if (metadata.annotations) {
    group.addControl('annotations', new UntypedFormGroup({}));

    const annotationsGroup = group.get('annotations') as UntypedFormGroup;
    for (const [key, val] of Object.entries(metadata.annotations)) {
      annotationsGroup.addControl(key, new UntypedFormControl(val, []));
    }
  }

  if (metadata.labels) {
    group.addControl('labels', new UntypedFormGroup({}));

    const labelsGroup = group.get('labels') as UntypedFormGroup;
    for (const [key, val] of Object.entries(metadata.labels)) {
      labelsGroup.addControl(key, new UntypedFormControl(val, []));
    }
  }

  return group;
}

export function createPvcSpecFormGroupFromPvc(
  pvc: V1PersistentVolumeClaim,
): UntypedFormGroup {
  const spec = pvc.spec;

  const group = new UntypedFormGroup({
    accessModes: new UntypedFormControl(spec.accessModes),
    resources: new UntypedFormGroup({
      requests: new UntypedFormGroup({
        storage: new UntypedFormControl(spec.resources.requests.storage),
      }),
    }),
    storageClassName: new UntypedFormControl({
      value: spec.storageClassName,
      disabled: !spec.storageClassName,
    }),
  });

  return group;
}

export function createExistingSourceFormGroupFromVolume(
  volume: V1Volume,
): UntypedFormGroup {
  // only PVC is currently implemented in the UI
  if (volume.persistentVolumeClaim) {
    return new UntypedFormGroup({
      persistentVolumeClaim: new UntypedFormGroup({
        claimName: new UntypedFormControl(
          volume.persistentVolumeClaim.claimName,
          [Validators.required],
        ),
        readOnly: new UntypedFormControl(volume.persistentVolumeClaim.readOnly),
      }),
    });
  }

  // create generic form control for all other options
  // https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.19/#volume-v1-core
  const group = new UntypedFormGroup({});
  for (const [key, val] of Object.entries(volume)) {
    group.addControl(key, new UntypedFormControl(val));
  }

  return group;
}

export function createNewPvcFormGroupFromVolume(
  pvc: V1PersistentVolumeClaim,
): UntypedFormGroup {
  return new UntypedFormGroup({
    metadata: createMetadataFormGroupFromPvc(pvc),
    spec: createPvcSpecFormGroupFromPvc(pvc),
  });
}

export function createFormGroupFromVolume(volume: Volume): UntypedFormGroup {
  const group = new UntypedFormGroup({
    mount: new UntypedFormControl(volume.mount, [Validators.required]),
  });

  if (volume.newPvc) {
    group.addControl('newPvc', createNewPvcFormGroupFromVolume(volume.newPvc));

    return group;
  }

  group.addControl(
    'existingSource',
    createExistingSourceFormGroupFromVolume(volume.existingSource),
  );

  return group;
}
