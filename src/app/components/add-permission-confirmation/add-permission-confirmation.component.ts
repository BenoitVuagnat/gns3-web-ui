import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Gns3object } from '@components/roles-and-permissions-management/roles-and-permissions-management.component';
import { Permission } from '@models/permissions/permission';
import { Server } from '@models/server';
import { PermissionService } from '@services/permission.service';
import { RoleService } from '@services/role.service';
import { ToasterService } from '@services/toaster.service';
import { UserService } from '@services/user.service';

@Component({
  selector: 'app-add-permission-confirmation',
  templateUrl: './add-permission-confirmation.component.html',
  styleUrls: ['./add-permission-confirmation.component.scss']
})
export class AddPermissionConfirmationComponent implements OnInit {

  methods:string[];
  action:string;
  objects: Gns3object[];
  destinations: Gns3object[];
  permissionsRecap = new Array();// recap that will be printed for the user
  server:Server;


  constructor(
    public dialogRef: MatDialogRef<AddPermissionConfirmationComponent>,
    private permissionService:PermissionService,
    private userService:UserService,
    private roleService:RoleService,
    private toasterService: ToasterService
  ) { }

  ngOnInit() {
    this.recapArrayCreation();
  }

  recapArrayCreation(){
    var met = this.methods[0];
    for(var i=1; i < this.methods.length; i++)
    {
      met = met.concat(", ", this.methods[i]);
    }
    for(var i=0; i < this.objects.length; i++)
    {
      for(var j=0; j < this.destinations.length; j++)
      {
        console.log("permission :",this.action," ",met,this.objects[i].name);
        this.permissionsRecap.push("permission :" + this.action.concat(" ",met," on ",this.objects[i].type," ",this.objects[i].name," for ",this.destinations[j].name));
      }
    }
  }

  onNoClick(): void {//if we want to cancel
    this.dialogRef.close();
  }

  onAddClick(): void{//we create the perm (if it doesnt already exist ?) then put link it to the user
    for(var i=0; i < this.objects.length; i++)
    {
      //this.createPath(i);
      console.log("PATH",this.createPath(i));
      console.log("OBJECTION", this.objects);
      //console.log("DESCRIPTION",this.createDescription(i));
      this.permissionService.createPermission(this.server,this.methods,this.createPath(i),this.action,this.createDescription(i)).subscribe(//for now added a default dedscription, for the future maybe bring back the expandable rows and have a field to input a description for each item
        (permission: Permission) => {
          for(var j=0; j < this.destinations.length; j++)
          {
            console.log("the perm sent back ", permission);
            if(this.destinations[j].type == "user"){//we check wether the destination is a role or a user to use the right service
              this.userService.addPermission(this.server, this.destinations[j].id,permission.permission_id).subscribe(
                ()=>{ console.log("success user");});
            }
            else{
              this.roleService.addPermission(this.server, this.destinations[j].id,permission.permission_id).subscribe(
                ()=>{ console.log("success role");});
            }
            //attribuer les permissions ici
            //console.log("permission :",this.action," ",met,this.objects[i].name);
            //this.permissionsRecap.push("permission :" + this.action.concat(" ",met," on ",this.objects[i].name," for ",this.destinations[j].name));
          }
      });
      console.log("all tab test", this.permissionsRecap);
      //console.log("permission :",this.action," ",this.toggles,this.selection.selected[i].name)
    }
    this.dialogRef.close();
    this.toasterService.success(`Permission(s) added.`);
  }

  createPath(i:number):string{//to create the path for the permission
    if(this.objects[i].projet_id !=""){//case where the object is inside a specific project
      console.log("What");
      console.log("/projects/"+this.objects[i].projet_id+"/"+this.objects[i].type+"s/"+this.objects[i].id);
      return "/projects/"+this.objects[i].projet_id+"/"+this.objects[i].type+"s/"+this.objects[i].id;
    }
    else
    {
      return "/"+this.objects[i].type+"s/"+this.objects[i].id;
    }
  }

  createDescription(i:number):string{//The default description for now
    var met = this.methods[0];
    for(var j=1; j < this.methods.length; j++)
    {
      met = met.concat(", ", this.methods[j]);
    }
    console.log("bon on est ou là", this.objects[i].type);
    return "permission :" + this.action + " " + met + " on " + this.objects[i].type + " " + this.objects[i].name;
  }

}
