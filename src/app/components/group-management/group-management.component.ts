import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatDialog } from '@angular/material/dialog';
import { MatSort, MatSortable } from '@angular/material/sort';
import { Group } from '@models/groups/group';
import { Server } from '@models/server';
import { GroupService } from '@services/group.service';
import { ServerService } from '@services/server.service';
import { DataSource } from '@angular/cdk/collections';
import { BehaviorSubject, merge, Observable } from 'rxjs';
import { map } from 'rxjs//operators';
import { AddGroupComponent } from '@components/add-group/add-group.component';
import { ConfirmationBottomSheetComponent } from '../projects/confirmation-bottomsheet/confirmation-bottomsheet.component';
import { User } from '@models/users/user';
import { ManageGroupComponent } from '@components/manage-group/manage-group.component';

@Component({
  selector: 'app-group-management',
  templateUrl: './group-management.component.html',
  styleUrls: ['./group-management.component.scss']
})
export class GroupManagementComponent implements OnInit {

  public server: Server;
  displayedColumns = ['name', 'created_at', 'actions'];
  groupDatabase = new GroupDatabase();
  dataSource: GroupDataSource;

  searchText: string = '';
  
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    private groupService:GroupService,
    private route: ActivatedRoute,
    private serverService: ServerService,
    public dialog: MatDialog,
    private bottomSheet: MatBottomSheet,
    private router: Router,
  ) { }

  ngOnInit() {

    let serverId = this.route.snapshot.paramMap.get('server_id');
        this.serverService.get(+serverId).then((server: Server) => {
            this.server = server;
            console.log("server :",this.server);
            this.groupService.getGroup(server).subscribe(
            (groups: Group[]) => {
              console.log("groups:",groups);
              this.groupDatabase.addGroups(groups);
            });
        });
        this.serverService.get(+serverId).then((server: Server) => {//test for getting users from a specific group
          this.server = server;
          console.log("server 2 :",this.server);
          this.groupService.getGroupMembers(server, "db6da178-df60-43f7-946f-ec0ccb989af6").subscribe(
          (users: User[]) => {
            console.log("users:",users);
          });
      });
        console.log('sort:', this.sort);
        this.sort.sort(<MatSortable>{
          id: 'name',
          start: 'asc',
        });
        console.log("groupDatabase : ", this.groupDatabase);
        this.dataSource = new GroupDataSource(this.groupDatabase, this.sort);
  }

  addGroup() {
    const dialogRef = this.dialog.open(AddGroupComponent, {
      width: '400px',
      autoFocus: false,
      disableClose: true,
    });
    let instance = dialogRef.componentInstance;
    instance.server = this.server;
    dialogRef.afterClosed().subscribe(result => {
      this.refresh();
    });
  }

  manageGroup(group: Group) {
    const dialogRef = this.dialog.open(ManageGroupComponent, {
      width: '950px',
      autoFocus: false,
      disableClose: true,
    });
    let instance = dialogRef.componentInstance;
    instance.server = this.server;
    instance.group = group;
  }

  delete(group: Group) {
    this.bottomSheet.open(ConfirmationBottomSheetComponent);
    let bottomSheetRef = this.bottomSheet._openedBottomSheetRef;
    bottomSheetRef.instance.message = 'Do you want to delete this group?';
    const bottomSheetSubscription = bottomSheetRef.afterDismissed().subscribe((result: boolean) => {
      if (result) {
        this.groupService.deleteGroup(this.server, group.user_group_id).subscribe(() => {
          //location.reload();
          this.refresh();
        });
      }
    });
  }

  refresh() {
    let serverId = this.route.snapshot.paramMap.get('server_id');
        this.serverService.get(+serverId).then((server: Server) => {
            this.server = server;
            console.log("server :",this.server);
            /*this.userService.getUser(server).subscribe((response: any) => {
              this.users = response;
          });*/
          this.groupService.getGroup(server).subscribe(
            (groups: Group[]) => {
              this.groupDatabase.addGroups(groups);
            });
        });
  }

  goToUserManagement() {
    let serverId = this.router.url.split("/server/")[1].split("/")[0];
    this.serverService.get(+serverId).then((server: Server) => {
      this.router.navigate(['/server', server.id, 'user_management']);
    });
  }

  goToPermissionManagement() {
    let serverId = this.router.url.split("/server/")[1].split("/")[0];
    this.serverService.get(+serverId).then((server: Server) => {
      this.router.navigate(['/server', server.id, 'roles_and_permissions_management']);
    });
  }

}

export class GroupDatabase {
  dataChange: BehaviorSubject<Group[]> = new BehaviorSubject<Group[]>([]);

  get data(): Group[] {
    return this.dataChange.value;
  }

  public addGroups(groups: Group[]) {
    this.dataChange.next(groups);
    console.log(this.dataChange);
  }

  public remove(group: Group) {
    const index = this.data.indexOf(group);
    if (index >= 0) {
      this.data.splice(index, 1);
      this.dataChange.next(this.data.slice());
    }
  }
}

export class GroupDataSource extends DataSource<any> {
  constructor(public groupDatabase: GroupDatabase, private sort: MatSort) {
    super();
  }

  connect(): Observable<Group[]> {
    const displayDataChanges = [this.groupDatabase.dataChange, this.sort.sortChange];

    return merge(...displayDataChanges).pipe(
      map(() => {
        console.log('sort active :', this.sort.active);
        if (!this.sort.active || this.sort.direction === '') {
          return this.groupDatabase.data;
        }

        return this.groupDatabase.data.sort((a, b) => {
          const isAsc = this.sort.direction === 'asc';

          const propertyA = a[this.sort.active];
          console.log('a :', a);
          const propertyB = b[this.sort.active];

          const valueA = isNaN(+propertyA) ? propertyA : +propertyA;
          const valueB = isNaN(+propertyB) ? propertyB : +propertyB;

          console.log("value de A :", valueA,"ValueB : ", valueB);

          return (valueA < valueB ? -1 : 1) * (isAsc ? 1 : -1);
        });
      })
    );
  }

  

  disconnect() {}
}