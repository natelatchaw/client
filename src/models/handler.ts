import { Dispatch } from 'discord-models';
import { AddEvent, RemoveEvent, CreateEvent, UpdateEvent, DeleteEvent } from 'discord-models';

export interface Handler<
    Add extends AddEvent | undefined, 
    Remove extends RemoveEvent | undefined, 
    Create extends CreateEvent | undefined, 
    Update extends UpdateEvent | undefined, 
    Delete extends DeleteEvent | undefined,
> {
    /**
     * @param { Dispatch<Event> } dispatch 
     * @notes This method should handle routing of the dispatched event to the appropriate event method using the dispatch.t property.
     */
    handle(dispatch: Dispatch<Event>): void;

    /**
     * @param { Add } event
     * @notes This method should handle events where data has been added.
     */
    add(event: Add): void;

    /**
     * @param { Remove } event
     * @notes This method should handle events where data has been removed.
     */
    remove(event: Remove): void;

    /**
     * @param { Create } event
     * @notes This method should handle events where data has been created.
     */
    create(event: Create): void;

    /**
     * @param { Update } event
     * @notes This method should handle events where data has been updated.
     */
    update(event: Update): void;

    /**
     * @param { Delete } event
     * @notes This method should handle events where data has been deleted.
     */
    delete(event: Delete): void;
}