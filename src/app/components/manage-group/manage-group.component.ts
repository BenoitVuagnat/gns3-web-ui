import { Component, OnInit, ViewChild } from '@angular/core';
import { Server } from '../../models/server';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import {MatAutocompleteSelectedEvent} from '@angular/material/autocomplete';
import { AbstractControl, FormBuilder, FormControl, FormGroup, FormGroupDirective, NgForm, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ProjectNameValidator } from '../projects/models/projectNameValidator';
import { ActivatedRoute, Router } from '@angular/router';
import {MatChipInputEvent} from '@angular/material/chips';
import {Observable} from 'rxjs';
import { User } from '@models/users/user';
import { Group } from '@models/groups/group';
import { GroupService } from '@services/group.service';
import { UserService } from '@services/user.service';
import {map, startWith} from 'rxjs/operators';
import { ServerService } from '@services/server.service';
import { ElementRef } from '@angular/core';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import { BrowserBackend } from '@sentry/browser/dist/backend';

@Component({
  selector: 'app-manage-group',
  templateUrl: './manage-group.component.html',
  styleUrls: ['./manage-group.component.scss']
})
export class ManageGroupComponent implements OnInit {
  server: Server;
  user: User;
  group: Group;
  groupForm: FormGroup;
  filteredUsers: Observable<string[]>;
  groupUsers : User[];//users that are currently in this group
  allUsers : User[];//all users
  selectable = true;
  removable = true;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  allUsernames : string[] = [];//all users
  usernames : string[] = [];//usernames of the users that will be in the group
  userCtrl = new FormControl();

  @ViewChild('userInput') userInput: ElementRef<HTMLInputElement>;

  constructor(
    public dialogRef: MatDialogRef<ManageGroupComponent>,
    private router: Router,
    private dialog: MatDialog,
    private formBuilder: FormBuilder,
    private projectNameValidator: ProjectNameValidator,
    private userService: UserService,
    private serverService: ServerService,
    private route: ActivatedRoute,
    private groupService: GroupService,
  ) { this.filteredUsers = this.userCtrl.valueChanges.pipe(//search for existing users
    startWith(null),
  map((username: string | null) => username ? this._filter(username) : this.allUsernames.slice()));}
  

  ngOnInit() {
    this.groupForm = this.formBuilder.group({
      name: new FormControl(
        null,
        [Validators.required, this.projectNameValidator.get],
      )});
    this.groupForm.controls['name'].setValue(this.group.name);//we set the default values 
    this.userService.getUser(this.server).subscribe(
      (users: User[]) => {
          this.allUsers = users;
          this.copyArray(users);
          //this.arrayToString();
          //console.log("users",this.allUsernames);
      });

      this.groupService.getGroupMembers(this.server, this.group.user_group_id).subscribe(//we get the users in this group
        (users: User[]) => {
          this.groupUsers = users;
          this.copyArray2(users);
          console.log("users in this group :",this.groupUsers);
        });
    console.log(this.server);
    
  }
  onKeyDown(event) {
    if (event.key === 'Enter') {
      this.onUpdateClick();
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
  
  copyArray(userArray : User[]): void {
    this.allUsers=userArray;
    this.arrayToString();
  }

  arrayToString(){
    /*this.allUsers.forEach(function(user){
      this.allUsernames.push(user.username);
    })*/
    for(var i=0;i<this.allUsers.length; i++)
    {
      this.allUsernames.push(this.allUsers[i].username);
    }
    console.log("usersss",this.allUsernames);
  }

  copyArray2(userArray : User[]): void {//copy array of the users in this group
    this.groupUsers=userArray;
    this.arrayToString2();
  }

  arrayToString2(){
    for(var i=0;i<this.groupUsers.length; i++)
    {
      this.usernames.push(this.groupUsers[i].username);
    }
    console.log("usernames in this group",this.usernames);
  }

  get form() {
    return this.groupForm.controls;
  }

  onUpdateClick(){
    this.updateGroup();
  }

  updateGroup(){
    //part dedicated to update the users
    for(var i=0;i<this.groupUsers.length; i++)
    {
      if(this.usernames.indexOf(this.groupUsers[i].username) == -1)//the user was deleted, no longer present in the new tab
      {
        console.log("user found and will be deleted");
        this.groupService.deleteGroupMember(this.server,this.group.user_group_id,this.groupUsers[i].user_id);
      }
      //if(this.groupUsers[i].username==//.indexOf(this.usernames[i])//this.usernames[i]
      /*else{//we will now compare if the username is already present in the group
        for(var j=0;j<this.usernames.length; i++)
        {
          if(this.usernames[j]==this.groupUsers[i].username)
        }
      }*/
    }
    var isPresent = 0;//to see if the user is already in the group or not
    for(var i=0;i<this.usernames.length; i++)
    {
      for(var j=0;j<this.groupUsers.length; i++)
      {
        if(this.usernames[i]==this.groupUsers[j].username)
        {
          isPresent = 1;
          break;//user is already in the group, no need to continue
        }
      }
      if(isPresent == 0){
        //we'll just find the corresponding user, with the username
        for(var k=0;k<this.allUsers.length; k++)
        {
          if(this.allUsers[k].username==this.usernames[i])
          {
            console.log("user found and will be added", this.allUsers[k].username);
            this.groupService.addGroupMember(this.server,this.group.user_group_id, this.allUsers[k].user_id);
          }
        }
        
        
      }
    }
    this.groupService
      .updateGroup(this.server, this.groupForm.controls['name'].value, this.group.user_group_id)
      .subscribe(() => {
        this.dialogRef.close();
        //this.toasterService.success(`Project ${project.name} added`);
        //maybe just reload the component ?
        location.reload();
      });

  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.allUsernames.filter(username => username.toLowerCase().includes(filterValue));
  }

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    // Add our user
    if (value) {
      this.usernames.push(value);

      
    }

    /*const index = this.allUsernames.indexOf(value);

    this.allUsernames.splice(index, 1);
    console.log("all users :", this.allUsernames);*/
    

    // Clear the input value
    event.chipInput!.clear();

    this.userCtrl.setValue(null);
    console.log("users", this.usernames);
    //this.allUsernames.
  }

  remove(username: string): void {
    const index = this.usernames.indexOf(username);

    if (index >= 0) {
      this.usernames.splice(index, 1);
      this.allUsernames.push(username);//we put back the user in the selection
    }
    
    console.log(this.usernames);
  }

  selected(event: MatAutocompleteSelectedEvent): void {

    const index = this.allUsernames.indexOf(event.option.viewValue);//we remove the user in the selection so we can't put it two times
    console.log("index:", index);
    this.allUsernames.splice(index, 1);
    console.log("all users :", this.allUsernames);

    this.usernames.push(event.option.viewValue);
    this.userInput.nativeElement.value = '';
    this.userCtrl.setValue(null);
    
  }


}
