import { Component, OnInit } from '@angular/core';
import { Server } from '../../models/server';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AbstractControl, FormBuilder, FormControl, FormGroup, FormGroupDirective, NgForm, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ProjectNameValidator } from '../projects/models/projectNameValidator';
import { projectNameAsyncValidator } from '../../validators/project-name-async-validator';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { ErrorStateMatcher } from '@angular/material/core';

export function passwordValidator(controlName: string, matchingControlName: string)  {//, control2 : FormControl){
  return (formGroup: FormGroup) => {
    const control = formGroup.controls[controlName];
    const matchingControl = formGroup.controls[matchingControlName];
    console.log("pwd ",control);
    if (matchingControl.errors && !matchingControl.errors.mustMatch) {
        // return if another validator has already found an error on the matchingControl
        return;
    }

    // set error on matchingControl if validation fails
    if (control.value !== matchingControl.value) {
        matchingControl.setErrors({ mustMatch: true });
    } else {
        matchingControl.setErrors(null);
    }
  }
}

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const invalidCtrl = !!(control && control.invalid && control.parent.dirty);
    const invalidParent = !!(control && control.parent && control.parent.invalid && control.parent.dirty);

    return (invalidCtrl || invalidParent);
  }
}

export const identityRevealedValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
  const pass = group.get('password').value;
  const confirmPass = group.get('confirm_password').value;
  console.log("pwd ", pass);
  console.log("conpwd ", confirmPass);

  return pass === confirmPass ? null : { notSame: true }
};

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.scss'],
  providers: [ProjectNameValidator],
})
export class AddUserComponent implements OnInit {
  server: Server;
  projectNameForm: FormGroup;
  matcher = new MyErrorStateMatcher();

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
      confirm_password: new FormControl(
        null,
        [Validators.required, this.projectNameValidator.get],
        //[projectNameAsyncValidator(this.server, this.projectService)]
      ),
    },{validator: passwordValidator('password', 'confirm_password')});
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

  checkPasswords(group: FormGroup) { // here we have the 'passwords' group
    let pass = group.controls.password.value;
    let confirmPass = group.controls.confirmPassword.value;

    return pass === confirmPass ? null : { notSame: true }
  }

}
