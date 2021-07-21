import { ActivatedRoute } from '@angular/router';
import { Component, OnInit,ViewChild  } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { Server } from '../../models/server';
import { ServerService } from '../../services/server.service';
import { UserService } from '../../services/user.service';
import { MatDialog } from '@angular/material/dialog';
import { AddUserComponent } from '../add-user/add-user.component';
import { User } from '@models/users/user';
import { MatSort, MatSortable } from '@angular/material/sort';
import { DataSource } from '@angular/cdk/collections';
import { BehaviorSubject, merge, Observable } from 'rxjs';
import { map } from 'rxjs//operators';
import { ManageUserComponent } from '@components/manage-user/manage-user.component';
import { ConfirmationBottomSheetComponent } from '../projects/confirmation-bottomsheet/confirmation-bottomsheet.component';



@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {

  users:any[]=[];
  public server: Server;
  displayedColumns = ['username', 'full_name', 'actions'];
  userDatabase = new UserDatabase();
  dataSource: UserDataSource;

  searchText: string = '';

  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    private userService:UserService,
    private route: ActivatedRoute,
    private serverService: ServerService,
    public dialog: MatDialog,
    private bottomSheet: MatBottomSheet,
    ) {}

  ngOnInit() {
    
    
    let serverId = this.route.snapshot.paramMap.get('server_id');
        this.serverService.get(+serverId).then((server: Server) => {
            this.server = server;
            console.log("server :",this.server);
            /*this.userService.getUser(server).subscribe((response: any) => {
              this.users = response;
          });*/
          this.userService.getUser(server).subscribe(
            (users: User[]) => {
              this.userDatabase.addUsers(users);
            });
        });
        this.sort.sort(<MatSortable>{
          id: 'username',
          start: 'asc',
        });
        this.dataSource = new UserDataSource(this.userDatabase, this.sort);
        /*this.server = this.route.snapshot.data['server'];
        this.refresh();*/
  }

  addUser() {
    const dialogRef = this.dialog.open(AddUserComponent, {
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

  manageUser(user: User) {
    const dialogRef = this.dialog.open(ManageUserComponent, {
      width: '950px',
      autoFocus: false,
      disableClose: true,
    });
    let instance = dialogRef.componentInstance;
    instance.server = this.server;
    instance.user = user;
  }

  delete(user: User) {
    this.bottomSheet.open(ConfirmationBottomSheetComponent);
    let bottomSheetRef = this.bottomSheet._openedBottomSheetRef;
    bottomSheetRef.instance.message = 'Do you want to delete this user?';
    const bottomSheetSubscription = bottomSheetRef.afterDismissed().subscribe((result: boolean) => {
      if (result) {
        this.userService.deleteUser(this.server, user.user_id).subscribe(() => {
          //location.reload();
          this.refresh();
        });
      }
    });
  }

  refresh() {//we use this to only refresh the displayed users instead of the whole page
    /*this.userService.getUser(this.server).subscribe(
      (users: User[]) => {
        this.userDatabase.addUsers(users);
      }//,
      //error) => {
        this.progressService.setError(error);
      }
    );*/
    let serverId = this.route.snapshot.paramMap.get('server_id');
        this.serverService.get(+serverId).then((server: Server) => {
            this.server = server;
            console.log("server :",this.server);
            /*this.userService.getUser(server).subscribe((response: any) => {
              this.users = response;
          });*/
          this.userService.getUser(server).subscribe(
            (users: User[]) => {
              this.userDatabase.addUsers(users);
            });
        });
  }

}

export class UserDatabase {
  dataChange: BehaviorSubject<User[]> = new BehaviorSubject<User[]>([]);

  get data(): User[] {
    return this.dataChange.value;
  }

  public addUsers(users: User[]) {
    this.dataChange.next(users);
  }

  public remove(user: User) {
    const index = this.data.indexOf(user);
    if (index >= 0) {
      this.data.splice(index, 1);
      this.dataChange.next(this.data.slice());
    }
  }
}

export class UserDataSource extends DataSource<any> {
  constructor(public userDatabase: UserDatabase, private sort: MatSort) {
    super();
  }

  connect(): Observable<User[]> {
    const displayDataChanges = [this.userDatabase.dataChange, this.sort.sortChange];

    return merge(...displayDataChanges).pipe(
      map(() => {
        if (!this.sort.active || this.sort.direction === '') {
          return this.userDatabase.data;
        }

        return this.userDatabase.data.sort((a, b) => {
          const isAsc = this.sort.direction === 'asc';

          const propertyA = a[this.sort.active];
          const propertyB = b[this.sort.active];

          const valueA = isNaN(+propertyA) ? propertyA : +propertyA;
          const valueB = isNaN(+propertyB) ? propertyB : +propertyB;

          console.log("value de A :", valueA,"ValueB : ", valueB);

          return (valueA < valueB ? -1 : 1) * (isAsc ? 1 : -1);
        });
      })
    );

    function compare(a: number | string, b: number | string, isAsc: boolean) {
      return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
    }
  }

  

  disconnect() {}
}
