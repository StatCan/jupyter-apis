import { Component, OnInit, OnDestroy } from "@angular/core";
import { NamespaceService } from "src/app/services/namespace.service";
import { Subscription } from "rxjs";

@Component({
  selector: "app-namespace-select",
  templateUrl: "./namespace-select.component.html",
  styleUrls: ["./namespace-select.component.scss"]
})
export class NamespaceSelectComponent implements OnInit, OnDestroy {
  currNamespace: string;

  private currNamespaceSub: Subscription;

  constructor(private namespaceService: NamespaceService) { }

  ngOnInit() {
    this.currNamespaceSub = this.namespaceService
      .getSelectedNamespace()
      .subscribe(namespace => this.currNamespace = namespace);
  }

  namespaceChanged(namespace: string) {
    if ("string" !== typeof namespace) {
      return;
    }
    this.namespaceService.updateSelectedNamespace(namespace);
  }

  ngOnDestroy() {
    this.currNamespaceSub.unsubscribe();
  }
}
