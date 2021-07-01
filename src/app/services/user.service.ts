import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Server } from '../models/server';
import { HttpServer } from './http-server.service';
import { User } from '../models/users/user';

@Injectable()
export class UserService {
  constructor(
    private httpServer: HttpServer
  ) {}
  

  getInformationAboutLoggedUser(server: Server) {
    return this.httpServer.get<User>(server, '/users/me/');
  }

  getUser(server: Server){
    //return this.http.get("http://10.237.0.165:3080/v3/users");
    return this.httpServer.get(server, '/users');
  }

  createUser(server: Server, username: string, email: string, full_name: string, password: string){
    //return this.http.get("http://10.237.0.165:3080/v3/users");
    return this.httpServer.post(server, '/users', { username: username, email: email, full_name: full_name, password: password});
  }


}
