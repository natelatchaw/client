import { MessageCreate, MessageUpdate, MessageDelete, Dispatch, CreateEvent, UpdateEvent, DeleteEvent } from "discord-models";
import { Handler } from "../models/handler";

export class MessageHandler implements Handler<undefined, undefined, MessageCreate, MessageUpdate, MessageDelete> {
    /**
     * @param { Dispatch<Event> } dispatch
     * @notes route event dispatch based on dispatch.d tag
     */
    public handle(dispatch: Dispatch<Event>): void {
        switch(dispatch.t) {
            case 'MESSAGE_CREATE': {
                let messageCreate: CreateEvent = dispatch.d as CreateEvent;
                this.create(messageCreate as MessageCreate);
            }
            case 'MESSAGE_UPDATE': {
                let messageUpdate: UpdateEvent = dispatch.d as UpdateEvent;
                this.update(messageUpdate as MessageUpdate);
            }
            case 'MESSAGE_DELETE': {
                let messageDelete: DeleteEvent = dispatch.d as DeleteEvent;
                this.delete(messageDelete as MessageDelete);
            }
        } 
    }

    public add(event: undefined): void { }

    public remove(event: undefined): void { }

    public create(event: MessageCreate): void {

    }

    public update(event: MessageUpdate): void {

    }
    
    public delete(event: MessageDelete): void {

    }
}
