import {Component, OnInit} from "@angular/core";
import {NamespaceService} from "../services/namespace.service";
import {KubernetesService} from "src/app/services/kubernetes.service";

import {Subscription} from "rxjs";
import {isEqual} from "lodash";
import {first} from "rxjs/operators";

import {ExponentialBackoff} from "src/app/utils/polling";
import {Volume, Resource} from "../utils/types";
import {PvcWithStatus} from "./volumes-table/volume-table.component"

@Component({
  selector: "app-main-table",
  templateUrl: "./main-table.component.html",
  styleUrls: ["./main-table.component.scss"]
})
export class MainTableComponent implements OnInit {
  currNamespace = "";
  namespaces = [];
  resources = [];

  pvcs: Volume[] = [];
  pvcProperties: PvcWithStatus[] = [];

  subscriptions = new Subscription();
  poller: ExponentialBackoff;

  constructor(
    public ns: NamespaceService,
    private k8s: KubernetesService,
  ) {}

  ngOnInit() {
    this.poller = new ExponentialBackoff({interval: 2000, retries: 3});
    const resourcesSub = this.poller.start().subscribe(() => {
      if (!this.currNamespace) {
        return;
      }

      Promise.all([
        this.k8s.getResource(this.currNamespace).toPromise(),
        this.k8s.getVolumes(this.currNamespace).toPromise()
      ]).then(([notebooks, volumes]) => {
        if (!isEqual(notebooks, this.resources) || !isEqual(volumes, this.pvcs)) {
          this.poller.reset();
        }
        this.resources = notebooks;
        this.pvcs = volumes;
        let mounts = Object.fromEntries(
          notebooks.flatMap(nb => nb.volumes.map(v => [v, nb]))
        );
        this.pvcProperties = volumes.map(v => ({
          pvc: v,
          mountedBy: mounts[v.name]?.name
        }));
      });
    });

    // Keep track of the selected namespace
    const namespaceSub = this.ns.getSelectedNamespace().subscribe(namespace => {
      this.currNamespace = namespace;
      this.poller.reset();
    });

    this.subscriptions.add(resourcesSub);
    this.subscriptions.add(namespaceSub);
  }

  deleteResource(rsrc: Resource): void {
    this.k8s
      .deleteResource(rsrc.namespace, rsrc.name)
      .pipe(first())
      .subscribe(r => {
        this.poller.reset();
      });
  }

  deletePvc(p: PvcWithStatus): void {
    this.k8s
      .deletePersistentVolumeClaim(p.pvc.namespace, p.pvc.name)
      .pipe(first())
      .subscribe(_ => {
        this.poller.reset();
      });
  }
}
