import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { PodDefault } from 'src/app/types';
import { Subscription } from 'rxjs';
import { NamespaceService } from 'kubeflow';
import { JWABackendService } from 'src/app/services/backend.service';

@Component({
  selector: 'app-form-configurations',
  templateUrl: './form-configurations.component.html',
  styleUrls: ['./form-configurations.component.scss'],
})
export class FormConfigurationsComponent implements OnInit, OnDestroy {
  podDefaults: PodDefault[];
  subscriptions = new Subscription();

  @Input() parentForm: FormGroup;

  constructor(public ns: NamespaceService, public backend: JWABackendService) {}

  ngOnInit() {
    // Keep track of the selected namespace
    const nsSub = this.ns.getSelectedNamespace().subscribe(namespace => {
      // Get the PodDefaults of the new Namespace
      this.backend.getPodDefaults(namespace).subscribe(pds => {
        // AAW Customization
        // This removed protected B. The entire configuration should be removed when we depricate Minio
        pds.forEach((item, index) => {
          if (item.label === 'notebook.statcan.gc.ca/protected-b')
            {pds.splice(index, 1);}
        });
        this.podDefaults = pds;
      });
    });

    this.subscriptions.add(nsSub);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
