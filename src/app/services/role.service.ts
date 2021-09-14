import { Injectable } from '@angular/core';
import { Server } from '../models/server';
import { HttpServer } from './http-server.service';
import { Role } from '../models/roles/role';

@Injectable({
  providedIn: 'root'
})
export class RoleService {

constructor(
  private httpServer: HttpServer
) { }

  getRoles(server: Server){
    return this.httpServer.get(server, '/roles');
  }

}
