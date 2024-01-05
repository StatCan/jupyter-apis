import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
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
  isVisible = false; //Hidding the configuration by default
  @Input() parentForm: UntypedFormGroup;

  constructor(public ns: NamespaceService, public backend: JWABackendService) {}

  ngOnInit() {
    // Keep track of the selected namespace
    const nsSub = this.ns.getSelectedNamespace().subscribe(namespace => {
      // Get the PodDefaults of the new Namespace
      this.backend.getPodDefaults(namespace).subscribe(pds => {
        this.podDefaults = pds;
        // If a poddefault exists, display configuration
        // Note: poddefault.go handles removing protected B from the list
        this.isVisible = this.podDefaults.length > 0;
      });
    });

    this.subscriptions.add(nsSub);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
