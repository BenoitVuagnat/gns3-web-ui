import { Component, OnInit } from '@angular/core';
import { Server } from '../../models/server';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ProjectNameValidator } from '../projects/models/projectNameValidator';
import { projectNameAsyncValidator } from '../../validators/project-name-async-validator';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.scss'],
  providers: [ProjectNameValidator],
})
export class AddUserComponent implements OnInit {
  server: Server;
  projectNameForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<AddUserComponent>,
    private router: Router,
    private dialog: MatDialog,
    private formBuilder: FormBuilder,
    private projectNameValidator: ProjectNameValidator,
    private userService: UserService,
  ) { }

  ngOnInit() {// review the form control
    this.projectNameForm = this.formBuilder.group({
      username: new FormControl(
        null,
        [Validators.required, this.projectNameValidator.get],
        //[projectNameAsyncValidator(this.server, this.projectService)]
      ),
      email: new FormControl(
        null,
        [Validators.required, this.projectNameValidator.get],
        //[projectNameAsyncValidator(this.server, this.projectService)]
      ),
      full_name: new FormControl(
        null,
        [Validators.required, this.projectNameValidator.get],
        //[projectNameAsyncValidator(this.server, this.projectService)]
      ),
      password: new FormControl(
        null,
        [Validators.required, this.projectNameValidator.get],
        //[projectNameAsyncValidator(this.server, this.projectService)]
      ),
    });
  }

  onKeyDown(event) {
    if (event.key === 'Enter') {
      this.onAddClick();
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  get form() {
    return this.projectNameForm.controls;
  }

  onAddClick(): void {
    if (this.projectNameForm.invalid) {
      return;
    }
    //add more conditions and check for formatting 
    /*this.userService.list(this.server).subscribe((projects: Project[]) => {
      const projectName = this.projectNameForm.controls['projectName'].value;
      let existingProject = projects.find((project) => project.name === projectName);

      if (existingProject) {
        this.openConfirmationDialog(existingProject);
      } else {
        this.addProject();
      }
    });*/
    this.addUser();
  }

  addUser(): void {
    //this.uuid = uuid();
    this.userService
      .createUser(this.server, this.projectNameForm.controls['username'].value, this.projectNameForm.controls['email'].value, this.projectNameForm.controls['full_name'].value, this.projectNameForm.controls['password'].value)
      .subscribe(() => {
        this.dialogRef.close();
        //this.toasterService.success(`Project ${project.name} added`);
        //maybe just reload the component ?
        //location.reload();
      });
  }

}
