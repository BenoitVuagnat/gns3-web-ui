import { ActivatedRoute } from '@angular/router';
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
        console.log('sort:', this.sort);
        this.sort.sort(<MatSortable>{
          id: 'name',
          start: 'asc',
        });
        console.log("groupDatabase : ", this.groupDatabase);
        this.dataSource = new GroupDataSource(this.groupDatabase, this.sort);
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