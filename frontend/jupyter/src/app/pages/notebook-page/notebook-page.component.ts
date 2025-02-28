import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  NamespaceService,
  STATUS_TYPE,
  ToolbarButton,
  PollerService,
  Status,
} from 'kubeflow';
import { JWABackendService } from 'src/app/services/backend.service';
import { Subscription } from 'rxjs';
import { NotebookRawObject } from 'src/app/types';
import { ActivatedRoute, Router } from '@angular/router';
import { V1Pod } from '@kubernetes/client-node';
import { ActionsService } from 'src/app/services/actions.service';
import { isEqual } from 'lodash-es';

@Component({
  selector: 'app-notebook-page',
  templateUrl: './notebook-page.component.html',
  styleUrls: ['./notebook-page.component.scss'],
})
export class NotebookPageComponent implements OnInit, OnDestroy {
  public notebookName: string;
  public namespace: string;
  public notebook: NotebookRawObject;
  public notebookPod: V1Pod;
  public notebookInfoLoaded = false;
  public podRequestCompleted = false;
  public podRequestError = '';
  public selectedTab = { index: 0, name: 'overview' };
  public buttonsConfig: ToolbarButton[] = [];

  pollSubNotebook = new Subscription();
  pollSubPod = new Subscription();
  namespaceSub = new Subscription();

  constructor(
    public ns: NamespaceService,
    public backend: JWABackendService,
    public poller: PollerService,
    public router: Router,
    public actions: ActionsService,

    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.ns.updateSelectedNamespace(params.namespace);
      this.notebookName = params.notebookName;
      this.namespace = params.namespace;

      this.poll(this.namespace, this.notebookName);
    });

    this.route.queryParams.subscribe(params => {
      this.selectedTab.name = params.tab;
      this.selectedTab.index = this.switchTab(this.selectedTab.name).index;
      this.selectedTab.name = this.switchTab(this.selectedTab.name).name;
    });

    this.namespaceSub.add(
      this.ns.getSelectedNamespace().subscribe(namespace => {
        if (this.namespace && this.namespace !== namespace) {
          this.router.navigate(['/']);
        }
      }),
    );
  }

  ngOnDestroy() {
    this.pollSubNotebook.unsubscribe();
    this.pollSubPod.unsubscribe();
    this.namespaceSub.unsubscribe();
  }

  private poll(namespace: string, notebook: string) {
    this.pollSubNotebook.unsubscribe();

    const request = this.backend.getNotebook(namespace, notebook);

    this.pollSubNotebook = this.poller.exponential(request).subscribe(nb => {
      this.notebook = this.processIncomingData(nb);
      this.getNotebookPod(nb);
      this.updateButtons();
      this.notebookInfoLoaded = true;
    });
  }

  private processIncomingData(notebook: NotebookRawObject) {
    const notebookCopy = JSON.parse(
      JSON.stringify(notebook),
    ) as NotebookRawObject;

    return notebookCopy;
  }

  private switchTab(name): { index: number; name: string } {
    if (name === 'yaml') {
      return { index: 3, name: 'yaml' };
    } else if (name === 'events') {
      return { index: 2, name: 'events' };
    } else if (name === 'logs') {
      return { index: 1, name: 'logs' };
    } else {
      return { index: 0, name: 'overview' };
    }
  }

  public onTabChange(c) {
    const queryParams = { tab: c.tab.textLabel.toLowerCase() };
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      replaceUrl: true,
      queryParamsHandling: '',
    });
  }

  private getNotebookPod(notebook: NotebookRawObject) {
    this.pollSubPod.unsubscribe();

    const request = this.backend.getNotebookPod(notebook);

    this.pollSubPod = this.poller.exponential(request).subscribe(
      pod => {
        this.notebookPod = pod;
        this.podRequestCompleted = true;
      },
      error => {
        this.podRequestError = error;
        this.notebookPod = null;
        this.podRequestCompleted = true;
      },
    );
  }

  navigateBack() {
    this.router.navigate(['/']);
  }

  get status(): Status {
    return this.notebook.processed_status;
  }

  private updateButtons() {
    const buttons: ToolbarButton[] = [];
    buttons.push(
      new ToolbarButton({
        text: $localize`CONNECT`,
        icon: 'developer_board',
        disabled: this.status.phase === STATUS_TYPE.READY ? false : true,
        tooltip: $localize`Connect to this notebook`,
        fn: () => {
          this.connectToNotebook();
        },
      }),
    );
    if (this.status.phase === 'stopped') {
      buttons.push(
        new ToolbarButton({
          text: $localize`START`,
          icon: 'play_arrow',
          tooltip: $localize`Start this notebook`,
          fn: () => {
            this.startNotebook();
          },
        }),
      );
    } else {
      buttons.push(
        new ToolbarButton({
          text: $localize`STOP`,
          icon: 'stop',
          disabled:
            this.status.phase === STATUS_TYPE.TERMINATING ? true : false,
          tooltip: $localize`Stop this notebook`,
          fn: () => {
            this.stopNotebook();
          },
        }),
      );
    }
    buttons.push(
      new ToolbarButton({
        text: $localize`DELETE`,
        icon: 'delete',
        disabled: this.status.phase === STATUS_TYPE.TERMINATING ? true : false,
        tooltip: $localize`Delete this notebook`,
        fn: () => {
          this.deleteNotebook();
        },
      }),
    );
    if (isEqual(buttons, this.buttonsConfig)) {
      return;
    }
    this.buttonsConfig = buttons;
  }

  private deleteNotebook() {
    this.actions
      .deleteNotebook(this.namespace, this.notebookName)
      .subscribe(_ => {
        this.router.navigate(['']);
      });
  }

  private connectToNotebook() {
    this.actions.connectToNotebook(this.namespace, this.notebookName);
  }

  private startNotebook() {
    this.actions
      .startNotebook(this.namespace, this.notebookName)
      .subscribe(_ => {
        this.poll(this.namespace, this.notebookName);
      });
  }

  private stopNotebook() {
    this.actions
      .stopNotebook(this.namespace, this.notebookName)
      .subscribe(_ => {
        this.poll(this.namespace, this.notebookName);
      });
  }
}
