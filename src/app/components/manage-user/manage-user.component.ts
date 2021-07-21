import { Component, OnInit } from '@angular/core';
import { Server } from '../../models/server';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AbstractControl, FormBuilder, FormControl, FormGroup, FormGroupDirective, NgForm, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ProjectNameValidator } from '../projects/models/projectNameValidator';
import { projectNameAsyncValidator } from '../../validators/project-name-async-validator';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { User } from '@models/users/user';
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
  /*
  //let pwd = control.get;
  console.log("pwd ",userForm: FormGroupcontrol.value);
  let conpwd = control.get('confirm_password');
  console.log("conpwd ", control.get('confirm_password'));
  if(pwd !== conpwd){
    return { passwordValidator: true };
  }
  return null;*/
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
  selector: 'app-manage-user',
  templateUrl: './manage-user.component.html',
  styleUrls: ['./manage-user.component.scss']
})

export class ManageUserComponent implements OnInit {
  server: Server;
  user: User;
  userForm: FormGroup;
  matcher = new MyErrorStateMatcher();

  constructor(
    public dialogRef: MatDialogRef<ManageUserComponent>,
    private router: Router,
    private dialog: MatDialog,
    private formBuilder: FormBuilder,
    private projectNameValidator: ProjectNameValidator,
    private userService: UserService,
  ) { }

  ngOnInit() {
    //console.log("user :", this.user.created_at);
    this.userForm = this.formBuilder.group({
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
    }, {validator: this.passwordValidator});
    this.userForm.controls['username'].setValue(this.user.username);//we set the default values 
    this.userForm.controls['email'].setValue(this.user.email);
    this.userForm.controls['full_name'].setValue(this.user.full_name);
  }

  onKeyDown(event) {
    if (event.key === 'Enter') {
      this.onUpdateClick();
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  get form() {
    return this.userForm.controls;
  }

  onUpdateClick(){
    this.updateUser();
  }

  updateUser(){
    this.userService
      .updateUser(this.server, this.userForm.controls['username'].value, this.userForm.controls['email'].value, this.userForm.controls['full_name'].value, this.userForm.controls['password'].value, this.user.user_id)
      .subscribe(() => {
        this.dialogRef.close();
        //this.toasterService.success(`Project ${project.name} added`);
        //maybe just reload the component ?
        location.reload();
      });

  }

  passwordValidator(control : FormControl) : ValidationErrors | null {
    let pwd = control.get('password');
    console.log('pwd',pwd);
    let conpwd = control.get('confirm_password');
    console.log('conpwd',conpwd);
    if(pwd !== conpwd){
      return { mustMatch: true };
    }
    return null;
  }


  checkPasswords(group: FormGroup) { // here we have the 'passwords' group
    let pass = group.controls.password.value;
    let confirmPass = group.controls.confirmPassword.value;

    return pass === confirmPass ? null : { notSame: true }
  }

}
