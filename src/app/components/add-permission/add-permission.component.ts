import {  animate, state, style, transition, trigger  } from '@angular/animations';
import { SelectionModel } from '@angular/cdk/collections';
import { ChangeDetectorRef, Component, OnInit, QueryList, TemplateRef, ViewChild, ViewChildren } from '@angular/core';
import { FormArray } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Gns3object } from '@components/roles-and-permissions-management/roles-and-permissions-management.component';
import { Role } from '@models/roles/role';
import { Server } from '@models/server';
import { User } from '@models/users/user';
import { RoleService } from '@services/role.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-add-permission',
  templateUrl: './add-permission.component.html',
  styleUrls: ['./add-permission.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0', visibility: 'hidden' })),
      state('expanded', style({height: '*', visibility: 'visible'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class AddPermissionComponent implements OnInit {

  server: Server;
  projectDataSource:  MatTableDataSource<object>;
  projectDataSource2:  MatTableDataSource<object>;
  allDataTab:Gns3object[];//containing the objects
  allDataTab2:Gns3object[];//containing roles and users
  displayedColumnsObjects = ['select','type', 'name', 'created_at'];

  selection = new SelectionModel<any>(true, []);
  selection2 = new SelectionModel<any>(true, []);
  selection3 = new SelectionModel<any>(true, []);

  selectionAction = new SelectionModel;
  
  formAction = new FormArray([]);
  
  isExpansionDetailRow = (i: number, row: Object) => row.hasOwnProperty('detailRow');
  expandedElement: Gns3object[] = [];

  searchText: string = '';
  searchText2: string = '';

  @ViewChild('projectSort',{static: true}) sort3: MatSort;
  @ViewChild('userSort',{static: true}) sort4: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChildren(MatPaginator) paginator2 = new QueryList<MatPaginator>();

  

  constructor(
    private userService:UserService,
    private roleService:RoleService,
    private cd: ChangeDetectorRef
  ) { }


  checkExpanded(element): boolean {//attempt to expand multiple rows
    let flag = false;
    this.expandedElement.forEach(e => {
      if(e === element) {
        flag = true;
        
      }
    });
    return flag;
  }

  pushPopElement(element) {
    const index = this.expandedElement.indexOf(element);//attempt to expand multiple rows
    console.log(index);
    if(index === -1) {
        this.expandedElement.push(element);
    } else {
      this.expandedElement.splice(index,1);
    }
  }
 

  ngOnInit() {
    //we put a default value
    const baseValue : Gns3object ={
      created_at : "",
      name : "",
      id : "",
      projet_id : "",
      project_name : "",
      type : "",
    };  
    this.allDataTab2= [baseValue];
    //console.log("projecto", this.projectDataSource);
    this.projectDataSource = new MatTableDataSource(this.allDataTab);
    //console.log("matable", this.allDataTab);
    
    console.log("server :",this.server);
    this.userService.getUser(this.server).subscribe(
    (users: User[]) => {
      console.log("users:", users);
      users.forEach(function (value : User){
        console.log("value :", value);
        const gns3Ob : Gns3object ={
          created_at : value.created_at,
          name : value.username,
          id :value.user_id,
          projet_id : "",
          project_name : "",
          type : "user",
        };  
        console.log("gns3ob", gns3Ob);
        console.log("allDataTab in loop", this);
        this.push(gns3Ob);//we add every project in the tab
      },this.allDataTab2);
      
      this.roleService.getRoles(this.server).subscribe(
      (roles: Role[]) => {
        console.log("roles :", roles);
        roles.forEach(function (value : Role){
          console.log("value :", value);
          const gns3Ob : Gns3object ={
            created_at : value.created_at,
            name : value.name,
            id :value.role_id,
            projet_id : "",
            project_name : "",
            type : "role",
          };  
          console.log("gns3ob", gns3Ob);
          console.log("allDataTab in loop", this);
          this.push(gns3Ob);//we add every project in the tab
        },this.allDataTab2);
        this.allDataTab2.shift();
        this.projectDataSource2 = new MatTableDataSource(this.allDataTab2);
        this.projectDataSource2.paginator= this.paginator2.toArray()[1]
        this.projectDataSource2.sort = this.sort4;
        //this.projectDataSource = this.projectDataSource = new MatTableDataSource(this.allDataTab2);
      });
    });
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.projectDataSource.data.length;
    return numSelected === numRows;
  }

  isAllSelected2() {
    const numSelected = this.selection2.selected.length;
    const numRows = this.projectDataSource2.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

        this.projectDataSource.data.forEach(row => this.selection.select(row));
  }

  masterToggle2() {
    if (this.isAllSelected2()) {
      this.selection2.clear();
      return;
    }

        this.projectDataSource2.data.forEach(row => this.selection2.select(row));
  }

  checkboxLabel(row?: Gns3object): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  checkboxLabel2(row?: Gns3object): string {
    if (!row) {
      return `${this.isAllSelected2() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection2.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  maisnan(){
    console.log("selection", this.selection);
  }

  maisnan2(row :object){
    console.log("selection2", row);
  }

  maisnanAction(row :object){
    console.log("selection2", row);
    this.formAction.insert;
    console.log("allow or deny ",this.formAction);
  }

  onTypeChange(type: string)
  {
    console.log("works :", type);
    
    //this.formAction.
  }


  ngAfterViewInit() {
    //this.cd.detectChanges();
    //this.cd.detectChanges();
    
    /*setInterval(() => {
      //this.cd.detach();
      this.cd.detach();
      this.cd.detectChanges();
      this.cd.reattach();
    }, 5000);*/
    
    this.projectDataSource.paginator = this.paginator2.toArray()[0]
    this.projectDataSource.sort = this.sort3;

    //
  }

  applyFilter(event: Event) {//search feature
    const filterValue = (event.target as HTMLInputElement).value;
    this.projectDataSource.filter = filterValue.trim().toLowerCase();

    if (this.projectDataSource.paginator) {
      this.projectDataSource.paginator.firstPage();
    }
  }

  applyFilter2(event: Event) {//search feature for 2nd tab
    const filterValue = (event.target as HTMLInputElement).value;
    this.projectDataSource2.filter = filterValue.trim().toLowerCase();

    if (this.projectDataSource2.paginator) {
      this.projectDataSource2.paginator.firstPage();
    }
  }

}
