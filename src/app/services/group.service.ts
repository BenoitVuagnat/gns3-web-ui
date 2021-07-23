import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Server } from '../models/server';
import { HttpServer } from './http-server.service';
import { Group } from '../models/groups/group';

@Injectable({
  providedIn: 'root'
})
export class GroupService {

constructor(
  private httpServer: HttpServer
) { }

getGroup(server: Server){
  return this.httpServer.get(server, '/groups');
}

}
