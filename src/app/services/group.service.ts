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

  createGroup(server: Server, name: string){
    return this.httpServer.post(server, '/groups', { name: name});
  }

  deleteGroup(server: Server, user_group_id: string)
  {
      return this.httpServer.delete(server, `/groups/${user_group_id}`);
  }

  updateGroup(server: Server, name: string, user_group_id: string){

    return this.httpServer.put(server, `/groups/${user_group_id}`, { name: name});

  }



  getGroupMembers(server: Server, user_group_id: string)
  {
    return this.httpServer.get(server, `/groups/${user_group_id}/members`);
  }

  deleteGroupMember(server: Server, user_group_id: string, user_id: string)
  {
    return this.httpServer.delete(server, `/groups/${user_group_id}/members/${user_id}`);
  }

  addGroupMember(server: Server, user_group_id: string, user_id: string)
  {
    return this.httpServer.put(server, `/groups/${user_group_id}/members/${user_id}`,{});
  }

}

