import { DataSource } from '@angular/cdk/collections';
import { Component, EventEmitter, OnInit, Output, ViewChild, ɵCodegenComponentFactoryResolver } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatDialog } from '@angular/material/dialog';
import { MatSort, MatSortable } from '@angular/material/sort';
import {MatPaginator} from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { Server } from '@models/server';
import { PermissionService } from '@services/permission.service';
import { ServerService } from '@services/server.service';
import { RoleService } from '@services/role.service';
import { BehaviorSubject, concat, merge, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Role } from '@models/roles/role';

import { ProjectService } from '@services/project.service';
import { Project } from '@models/project';
import { array } from 'yargs';
import { Permission } from '@models/permissions/permission';
import { SymbolService } from '@services/symbol.service';
import { Symbol } from '@models/symbol';
import { TemplateService } from '@services/template.service';
import { Template } from '@models/template';
import { NodeService } from '@services/node.service';
import { Node } from 'app/cartography/models/node';
import { MatTableDataSource } from '@angular/material/table';
import { ComputeService } from '@services/compute.service';
import { Compute } from '@models/compute';
import { ApplianceService } from '@services/appliances.service';
import { Appliance } from '@models/appliance';
import { LinkService } from '@services/link.service';
import { Link } from '@models/link';
import { DrawingService } from '@services/drawing.service';
import { Drawing } from 'app/cartography/models/drawing';
import { SnapshotService } from '@services/snapshot.service';
import { Snapshot } from '@models/snapshot';
import { resolve } from 'path/posix';
import { AddPermissionComponent } from '@components/add-permission/add-permission.component';
import { ConfirmationBottomSheetComponent } from '@components/projects/confirmation-bottomsheet/confirmation-bottomsheet.component';


@Component({
  selector: 'app-roles-and-permissions-management',
  templateUrl: './roles-and-permissions-management.component.html',
  styleUrls: ['./roles-and-permissions-management.component.scss']
})
export class RolesAndPermissionsManagementComponent implements OnInit {


  public server: Server;
  displayedColumns = ['path', 'right', 'methods', 'created_at', 'actions'];//columns for permissions
  displayedColumnsRoles = ['name', 'created_at', 'actions'];//columns for roles
  displayedColumnsObjects = ['type', 'name', 'created_at'];
  groupDatabase = new ObjectDatabase();
  dataSource: ObjectDataSource;
  roleDatabase = new ObjectDatabase();
  roleDataSource: ObjectDataSource;
  projectDatabase = new ObjectDatabase();
  //projectDataSource: ObjectDataSource;
  projectDataSource:  MatTableDataSource<object>;
  allDatabase = new ObjectDatabase();//we'll use those two to print all existing objects
  allDataSource: ObjectDataSource;
  allDataTab:Gns3object[];
  test = 0;

  searchText: string = '';
  
  //@ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('permissionSort', { static: true }) sort: MatSort;
  @ViewChild('roleSort',{static: true}) sort2: MatSort;
  @ViewChild('projectSort',{static: true}) sort3: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    private permissionService:PermissionService,
    private roleService:RoleService,
    private route: ActivatedRoute,
    private serverService: ServerService,
    private projectService: ProjectService,
    private templateService: TemplateService,
    private computeService: ComputeService,
    private applianceService : ApplianceService,
    private nodeService: NodeService,
    private linkService: LinkService,
    private drawingService: DrawingService,
    private snapshotService: SnapshotService,
    private symbolService: SymbolService,
    public dialog: MatDialog,
    private bottomSheet: MatBottomSheet,
    private router: Router,
  ) { }

  ngOnInit() {
    this.getAllObjects();
    let serverId = this.route.snapshot.paramMap.get('server_id');
    this.serverService.get(+serverId).then((server: Server) => {
      this.server = server;
      console.log("server :",this.server);
      this.permissionService.getPermissions(server).subscribe(
      (permissions: Permissions[]) => {
        console.log("permissions:", permissions);
        //this.groupDatabase.addPermissions(permissions);
      });
    });

    this.serverService.get(+serverId).then((server: Server) => {
      this.server = server;
      console.log("server :",this.server);
      this.roleService.getRoles(server).subscribe(
      (roles: Role[]) => {
        console.log("roles:", roles);
        this.roleDatabase.addPermissions(roles);
      });
    });

    console.log('sort:', this.sort);
        this.sort.sort(<MatSortable>{
          id: 'path',
          start: 'asc',
        });
        console.log("groupDatabase : ", this.groupDatabase);
        this.dataSource = new ObjectDataSource(this.groupDatabase, this.sort, this.paginator);

    console.log('sort:', this.sort2);
    this.sort2.sort(<MatSortable>{
      id: 'name',
      start: 'asc',
    });
    console.log("roleDatabase : ", this.roleDatabase);
    this.roleDataSource = new ObjectDataSource(this.roleDatabase, this.sort2, this.paginator);
  }

  addPermission() {
    const dialogRef = this.dialog.open(AddPermissionComponent, {
      width: '1400px',
      autoFocus: false,
      disableClose: true,
    });
    let instance = dialogRef.componentInstance;
    instance.server = this.server;
    //instance.projectDataSource = this.projectDataSource;
    instance.allDataTab = this.allDataTab;
    /*instance.sort3 =this.sort3;
    instance.paginator = this.paginator;*/
    /*dialogRef.afterClosed().subscribe(result => {
      this.refresh();
    });*/
  }

  onTypeChange(type: string) {//fonction triggered when the user wants to display another type of object
    console.log("works :", type);
    console.log("projectDatabase at first : ", this.projectDatabase);
    if(type == "Projects")
    {
      if(this.projectDatabase.dataChange.value.length == 0)//checking if we already have the data
      {
        let serverId = this.route.snapshot.paramMap.get('server_id');
        this.serverService.get(+serverId).then((server: Server) => {
          this.server = server;
          console.log("server :",this.server);
          this.projectService.list(server).subscribe(
            (projects: Project[]) => {
              console.log("projects : ", projects);
              this.projectDatabase.addPermissions(projects);
            });
        });
        console.log('sort:', this.sort3);
        this.sort3.sort(<MatSortable>{
          id: 'name',
          start: 'asc',
        });
        console.log("projectDatabase : ", this.projectDatabase);
        //this.projectDataSource = new ObjectDataSource(this.projectDatabase, this.sort3, this.paginator);

      }
      else{
        //this.projectDataSource = new ObjectDataSource(this.projectDatabase, this.sort3, this.paginator);
      }
    }

    else if(type == "Roles"){//we just put the role data that we already have
      console.log('sort:', this.sort3);
        this.sort3.sort(<MatSortable>{
          id: 'name',
          start: 'asc',
        });
      //this.projectDataSource = new ObjectDataSource(this.roleDatabase, this.sort3, this.paginator);
    }

    /*else if(type == "All"){
      this.getAllObjects();
      
    }*/
  }

  createLinkName(link : Link){//by default links don't have names
    //first we'll try to get the names of both nodes
    var nameA;
    var nameB;
    for(var i=0; i<this.allDataTab.length; i++)
    {
      if(this.allDataTab[i].type == "node" && this.allDataTab[i].id == link.nodes[0].node_id){
        console.log("nomA", this.allDataTab[i].name)
        nameA = this.allDataTab[i].name;
      }
      if(this.allDataTab[i].type == "node" && this.allDataTab[i].id == link.nodes[1].node_id){
        nameB = this.allDataTab[i].name;
      }
    }
    console.log("nom final", nameA.concat("@",nameB));
    return nameA.concat("@",nameB); 
  }

  createPermissionName(permission : Permission)
  {
    //permission.path.substr
    var a = permission.path.indexOf("/");//we're gonna look for the type of object, by looking at what is between the first two /
    var b = permission.path.indexOf("/", a+1)//position of the 2nd /
    console.log("formatt",permission.path.substr(a+1));
    //console.log("permission formatting",permission, permission.path.indexOf("/"),  permission.path.indexOf("/", permission.path.indexOf("/")+1));
    if(b == -1)//case where we have the rights on all objects of an endpoint, like all nodes
    {
      if(permission.path.length ==1 ){
        return "All objects"
      }
      else{
        return "All ".concat(permission.path.substr(a+1));
      }
    }
    else if(permission.path.charAt(b+1)=="*"){//case where formatting is a little bit different but it's the same as just above
      return "All ".concat(permission.path.substring(a+1, b));
    }
    else{//case where its linked to a specific object
      var c = permission.path.indexOf("/", b+1)
      if(c-b == 37)//size for a uid
      {
        if(permission.path.length==c+1 || permission.path.charAt(c+1)=="*"){//he have all rights on the object
          return permission.path.substring(a+1, b-1).concat(" ", this.getObjectName(permission.path.substring(b+1, c)));
        }
        var d = permission.path.indexOf("/", c+1);
        if (d==-1){
          return "All ".concat(permission.path.substr(c+1), " ", this.getObjectName(permission.path.substring(b+1, c)));
        }
        else if(permission.path.length==d+1 || permission.path.charAt(d+1)=="*")//case where have all rights on all subitems of a specific type
        {
          return "All ".concat(permission.path.substring(c+1, d), " ", this.getObjectName(permission.path.substring(b+1, c)));
        }
        var e = permission.path.indexOf("/", d+1);//case for a specific node in a project
        //console.log("e est là", permission.path.substring(d+1, e));
        if(e-d == 37){
          return permission.path.substring(c+1, d-1).concat(" ", this.getObjectName(permission.path.substring(b+1, c)),"/",this.getObjectName(permission.path.substring(d+1, e)));
        }

      }
    }
    //case where it's an object inside of another one (ex : node in a project)

  }

  formatPermssion(permissions : Permission[]){//method to format a permission tab 
    permissions.forEach(function (value : Permission){
      value.path= this.createPermissionName(value);
    },this);
    return permissions;
  }

  getObjectName(id : string){
    for(var i=0; i<this.allDataTab.length; i++)
    {
      if(this.allDataTab[i].id == id){
        return this.allDataTab[i].name;
      }
    }
  }

  getAllObjects(){//function called when we want to get all gns3 items
    
    const baseValue : Gns3object ={
      created_at : "",
      name : "",
      id : "",
      projet_id : "",
      project_name : "",
      type : "",
    };  
    this.allDataTab= [baseValue];
    console.log("allDataTab 1 :",this.allDataTab);
    if(1)//checking if we already have the data for projects
    {
      let serverId = this.route.snapshot.paramMap.get('server_id');
        this.serverService.get(+serverId).then((server: Server) => {
          this.server = server;
          console.log("server :",this.server);
          
          const promise1 = new Promise ((resolve)=> {  this.roleService.getRoles(server).subscribe(
            (roles: Role[]) => {
              console.log("roles : ", roles);
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
              },this.allDataTab);
              resolve("");
            });
          });

              const promise3 = new Promise ((resolve)=> { this.symbolService.list(server).subscribe(
                (symbols: Symbol[]) => {
                  console.log("symbols : ", symbols);
                  symbols.forEach(function (value : Symbol){
                    console.log("value :", value);
                    const gns3Ob : Gns3object ={
                      created_at : "",
                      name : value.filename,
                      id :value.symbol_id,
                      projet_id : "",
                      project_name : "",
                      type : "symbol",
                    };  
                    console.log("gns3ob", gns3Ob);
                    console.log("allDataTab in loop", this);
                    this.push(gns3Ob);//we add every symbol in the tab
                  },this.allDataTab);
                  resolve("");
                });
              });

                const promise4 = new Promise ((resolve)=> { this.templateService.list(server).subscribe(
                  (templates: Template[]) => {
                    console.log("templates : ", templates);
                    templates.forEach(function (value : Template){
                      console.log("value :", value);
                      const gns3Ob : Gns3object ={
                        created_at : "",//API sends a value for this, model needs to be updated
                        name : value.name,
                        id :value.template_id,
                        projet_id : "",
                        project_name : "",
                        type : "template",
                      };  
                      console.log("gns3ob", gns3Ob);
                      console.log("allDataTab in loop", this);
                      this.push(gns3Ob);//we add every project in the tab
                    },this.allDataTab);
                    resolve("");
                  });
                });

                  const promise5 = new Promise ((resolve)=> {  this.computeService.getComputes(server).subscribe(
                    (computes: Compute[]) => {
                      console.log("computes : ", computes);
                      computes.forEach(function (value : Compute){
                        console.log("value :", value);
                        const gns3Ob : Gns3object ={
                          created_at : "",//API sends a value for this, model needs to be updated
                          name : value.name,
                          id :value.compute_id,
                          projet_id : "",
                          project_name : "",
                          type : "compute",
                        };  
                        console.log("gns3ob", gns3Ob);
                        console.log("allDataTab in loop", this);
                        this.push(gns3Ob);//we add every project in the tab
                      },this.allDataTab);
                      resolve("");
                    });
                  });

                    const promise6 = new Promise ((resolve)=> { this.applianceService.getAppliances(server).subscribe(
                      (appliances: Appliance[]) => {
                        console.log("appliances : ", appliances);
                        appliances.forEach(function (value : Appliance){
                          console.log("value :", value);
                          const gns3Ob : Gns3object ={
                            created_at : "",//API sends a value for this, model needs to be updated
                            name : value.name,
                            id :"",
                            projet_id : "",
                            project_name : "",
                            type : "appliance",
                          };  
                          console.log("gns3ob", gns3Ob);
                          console.log("allDataTab in loop", this);
                          this.push(gns3Ob);//we add every project in the tab
                        },this.allDataTab);
                        resolve("");
                      });
                    });

            Promise.all([promise1, promise3, promise4, promise5, promise6]).then((values) =>
            {
              this.projectService.list(server).subscribe(
                (projects: Project[]) => {
                  console.log("projects : ", projects);
                  projects.forEach(function (value : Project){
                    console.log("value :", value);
                    const gns3Ob : Gns3object ={
                      created_at : "",
                      name : value.name,
                      id :value.project_id,
                      projet_id : "",
                      project_name : "",
                      type : "project",
                    };  
                    console.log("gns3ob", gns3Ob);
                    console.log("allDataTab in loop", this);
                    this.push(gns3Ob);//we add every project in the tab
                  },this.allDataTab);
                  projects.forEach(function(value : Project){//we'll get objects that are inside eache projects
                    console.log("this : ", this);
                    this.projectService.open(server,value.project_id).subscribe(() => {//we open the project first, else we can't get the objects inside of it
                      const promiseNode= new Promise ((resolve)=> {  this.nodeService.list(server,value).subscribe(
                        (nodes: Node[]) => {
                          console.log("nodes : ", nodes);
                          nodes.forEach(function (value : Node){
                            console.log("value :", value);
                            const gns3Ob : Gns3object ={
                              created_at : "",
                              name : value.name,
                              id :value.node_id,
                              projet_id : value.project_id,
                              project_name : "",
                              type : "node",
                            };  
                            console.log("gns3ob", gns3Ob);
                            console.log("allDataTab in loop", this);
                            this.push(gns3Ob);//we add every project in the tab
                          },this.allDataTab);
                          this.linkService.getLinks(server,value.project_id).subscribe(
                            (links: Link[]) => {
                              console.log("links : ", links);
                              links.forEach(function (value : Link){
                                console.log("value :", value);
                                const gns3Ob : Gns3object ={
                                  created_at : "",
                                  name : this.createLinkName(value),
                                  id :value.link_id,
                                  projet_id : value.project_id,
                                  project_name : "",
                                  type : "link",
                                };  
                                console.log("gns3ob", gns3Ob);
                                console.log("allDataTab in loop", this.allDataTab);
                                this.allDataTab.push(gns3Ob);//we add every project in the tab
                              },this);
                              resolve("");
                            });
                        });
                      });
                      

                          const promiseDrawing = new Promise ((resolve)=> {   this.drawingService.getDrawings(server,value.project_id).subscribe(
                          (drawings: Drawing[]) => {
                            console.log("drawings : ", drawings);
                            drawings.forEach(function (value : Drawing){
                              console.log("value :", value);
                              const gns3Ob : Gns3object ={
                                created_at : "",
                                name : value.svg,
                                id :value.drawing_id,
                                projet_id : value.project_id,
                                project_name : "",
                                type : "drawing",
                              };  
                              console.log("gns3ob", gns3Ob);
                              console.log("allDataTab in loop", this.allDataTab);
                              this.allDataTab.push(gns3Ob);//we add every project in the tab
                            },this);
                            resolve("");
                          });
                        });

                          const promiseSnapshot = new Promise ((resolve)=> {   this.snapshotService.list(server,value.project_id).subscribe(
                            (snapshots: Snapshot[]) => {
                              console.log("snapshots : ", snapshots);
                              snapshots.forEach(function (value : Snapshot){
                                console.log("value :", value);
                                const gns3Ob : Gns3object ={
                                  created_at : value.created_at,
                                  name : value.name,
                                  id :value.snapshot_id.toString(),
                                  projet_id : value.project_id.toString(),
                                  project_name : "",
                                  type : "snapshot",
                                };  
                                console.log("gns3ob", gns3Ob);
                                console.log("allDataTab in loop", this.allDataTab);
                                this.allDataTab.push(gns3Ob);//we add every project in the tab
                              },this);
                              resolve("");
                            });
                          });
                      
                      Promise.all([promiseNode, promiseDrawing, promiseSnapshot]).then((values) => 
                      {
                        this.test++;
                        console.log("test", this.test);
                        console.log("first eleme :", this.allDataTab[0]);
                        if(this.allDataTab[0].type == ""){
                          this.allDataTab.shift();//we get rid of the first empty value
                        }
                        if(this.test == 1){//we make sure that the promise was called only once
                          this.permissionService.getPermissions(server).subscribe(
                            (permissions: Permission[]) => {
                              console.log("permissions : ", permissions);
                              this.groupDatabase.addPermissions(this.formatPermssion(permissions));//we also get data for just the permission tab since we need all objects to build it properly
                              console.log("les permissions sont :", permissions);
                              permissions.forEach(function (value : Permission){
                                
                                const gns3Ob : Gns3object ={
                                  created_at : value.created_at,
                                  name : value.path,
                                  id :value.permission_id,
                                  projet_id : "",
                                  project_name : "",
                                  type : "permission",
                                };  
                                console.log("gns3ob", gns3Ob);
                                console.log("allDataTab in loop", this.allDataTab);
                                this.allDataTab.push(gns3Ob);//we add every project in the tab
                              },this);
                              console.log('sort:', this.sort3);
                              this.sort3.sort(<MatSortable>{
                                id: 'name',
                                start: 'asc',
                              });
                              this.allDatabase.addPermissions(this.allDataTab);
                              //this.projectDataSource = new ObjectDataSource(this.allDatabase, this.sort3, this.paginator);
                              this.projectDataSource = new MatTableDataSource(this.allDataTab);
                              console.log("matable", this.allDataTab);
                              this.projectDataSource.paginator = this.paginator;
                              this.projectDataSource.sort = this.sort3;
                              //this.projectDataSource.
                            });
                        }  
                      });

                    });
                    
                  },this)
                  
                });
                
            });

          
        });
    }
  }

  deletePermission(permission: Permission) {
    this.bottomSheet.open(ConfirmationBottomSheetComponent);
    let bottomSheetRef = this.bottomSheet._openedBottomSheetRef;
    bottomSheetRef.instance.message = 'Do you want to delete this permission?';
    console.log("this serv :", this.server);
    const bottomSheetSubscription = bottomSheetRef.afterDismissed().subscribe((result: boolean) => {
      if (result) {
        this.permissionService.deletePermission(this.server, permission.permission_id).subscribe(() => {
          //location.reload();
          this.refresh();
        });
      }
    });
  }

  refresh() {//we use this to only refresh the displayed permissions instead of the whole page
    this.permissionService.getPermissions(this.server).subscribe(
      (permissions: Permission[]) => {
        this.groupDatabase.addPermissions(this.formatPermssion(permissions));
    });
  }

  applyFilter(event: Event) {//search feature
    const filterValue = (event.target as HTMLInputElement).value;
    this.projectDataSource.filter = filterValue.trim().toLowerCase();

    if (this.projectDataSource.paginator) {
      this.projectDataSource.paginator.firstPage();
    }
  }

  goToUserManagement() {
    let serverId = this.router.url.split("/server/")[1].split("/")[0];
    this.serverService.get(+serverId).then((server: Server) => {
      this.router.navigate(['/server', server.id, 'user_management']);
    });
  }

  goToGroupManagement() {
    let serverId = this.router.url.split("/server/")[1].split("/")[0];
    this.serverService.get(+serverId).then((server: Server) => {
      this.router.navigate(['/server', server.id, 'group_management']);
    });
  }

}

export class ObjectDatabase {
  dataChange: BehaviorSubject<Object[]> = new BehaviorSubject<Object[]>([]);
  

  get data(): Object[] {
    return this.dataChange.value;
  }

  public addPermissions(groups: Object[]) {
    this.dataChange.next(groups);
    //console.log("Property :", this.dataChange.value[0].hasOwnProperty);
    console.log(this.dataChange);
  }

  public remove(group: Object) {
    const index = this.data.indexOf(group);
    if (index >= 0) {
      this.data.splice(index, 1);
      this.dataChange.next(this.data.slice());
    }
  }
}

export class ObjectDataSource extends DataSource<any> {
  constructor(public objectDatabase: ObjectDatabase, private sort: MatSort, private paginator: MatPaginator) {
    super();
  }

  connect(): Observable<Object[]> {
    const displayDataChanges = [this.objectDatabase.dataChange, this.sort.sortChange];


    return merge(...displayDataChanges).pipe(
      map(() => {
        //console.log('sort active :', this.sort.active);
        if (!this.sort.active || this.sort.direction === '') {
          return this.objectDatabase.data;
        }

        return this.objectDatabase.data.sort((a, b) => {
          const isAsc = this.sort.direction === 'asc';

          const propertyA = a[this.sort.active];
          //console.log('a :', a);
          const propertyB = b[this.sort.active];

          const valueA = isNaN(+propertyA) ? propertyA : +propertyA;
          const valueB = isNaN(+propertyB) ? propertyB : +propertyB;

          //console.log("value de A :", valueA,"ValueB : ", valueB);

          return (valueA < valueB ? -1 : 1) * (isAsc ? 1 : -1);
        });
      })
    );
  }



  

  disconnect() {}
}

export interface Gns3object {//interface that we'll use to save an object's main info
  name : string;
  created_at : string;
  id : string;
  projet_id : string;//if the object is part of a project
  project_name : string;
  type : string; //Node, roles, etc ...
}
