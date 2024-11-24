import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { QueryClient, mutationOptions } from '@tanstack/angular-query-experimental';
import { Observable, lastValueFrom, map, tap } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class TasksService {
    #queryClient = inject(QueryClient); // Manages query state and caching
    #http = inject(HttpClient); // Handles HTTP requests

    /**
     * Fetches all tasks from the API.
     * Returns an observable containing an array of task strings.
     */
    allTasks$ = () => this.#http.get<Array<string>>('/api/tasks');

    /**
     * Creates a mutation for adding a task.
     * On success, invalidates and refetches the "tasks" query cache to update the task list.
     */
    addTask() {
        return mutationOptions({
            mutationFn: (task: string) => lastValueFrom(this.#http.post('/api/tasks', task)),
            mutationKey: ["tasks"],
            onSuccess: () => {
                this.#queryClient.invalidateQueries({ queryKey: ["tasks"] });
                this.#queryClient.refetchQueries({ queryKey: ["tasks"] });
            },
        });
    }

    /**
     * Creates a mutation for clearing all tasks.
     * On success, invalidates and refetches the "tasks" query cache to ensure consistency.
     */
    clearAllTasks() {
        return mutationOptions({
            mutationFn: () => lastValueFrom(this.#http.delete('/api/tasks')),
            mutationKey: ["clearTasks"],
            onSuccess: () => {
                this.#queryClient.invalidateQueries({ queryKey: ["tasks"] });
                this.#queryClient.refetchQueries({ queryKey: ["tasks"] });
            },
        });
    }
}
