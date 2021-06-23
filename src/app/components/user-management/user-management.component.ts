import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { Server } from '../../models/server';
import { ServerService } from '../../services/server.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {

  users:any[]=[];
  public server: Server;

  constructor(
    private userService:UserService,
    private route: ActivatedRoute,
    private serverService: ServerService
    ) {}

  ngOnInit() {
    let serverId = this.route.snapshot.paramMap.get('server_id');
        this.serverService.get(+serverId).then((server: Server) => {
            this.server = server;
            this.userService.getUser(server).subscribe((response: any) => {
              this.users = response;
          });
        });
  }

}
