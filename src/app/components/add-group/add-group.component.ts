import { Component, OnInit } from '@angular/core';
import { Server } from '../../models/server';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ProjectNameValidator } from '../projects/models/projectNameValidator';
import { projectNameAsyncValidator } from '../../validators/project-name-async-validator';
import { GroupService } from '../../services/group.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-add-group',
  templateUrl: './add-group.component.html',
  styleUrls: ['./add-group.component.scss'],
  providers: [ProjectNameValidator],
})
export class AddGroupComponent implements OnInit {
  server: Server;
  projectNameForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<AddGroupComponent>,
    private router: Router,
    private dialog: MatDialog,
    private formBuilder: FormBuilder,
    private projectNameValidator: ProjectNameValidator,
    private groupService: GroupService,
  ) { }

  ngOnInit() {
    this.projectNameForm = this.formBuilder.group({
      name: new FormControl(
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
    this.addGroup();
  }

  addGroup(): void {
    //this.uuid = uuid();
    this.groupService
      .createGroup(this.server, this.projectNameForm.controls['name'].value)
      .subscribe(() => {
        this.dialogRef.close();
      });
  }

}
