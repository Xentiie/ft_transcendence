import { Socket } from "socket.io";

interface EventInfo {
    timestamp:number
    ok:boolean
    request_id:string
    error?:string
    data?:any

    next: (timeout?:number) => Promise<EventInfo>
}

export async function on(socket: Socket, event: string, timeout?:number): Promise<EventInfo> { //10secs timeout
    return new Promise<EventInfo>((resolve, reject) => {
        const timeout = setTimeout(() => {socket.off(event, resp_resolve); reject({timestamp:Date.now(), ok:false, error: "Timeout"})})
        function resp_resolve(response: EventInfo) {
            clearTimeout(timeout)
            resolve(response)
        }
        socket.once(event, resp_resolve)
    })
}

export async function emit(socket: Socket, event: string, data?: any, prev?:EventInfo): Promise<EventInfo> {
    const requestId = prev ? prev.request_id : `${event}_${Date.now()}`

    return new Promise<EventInfo>((resolve, reject) => {
        const event_info: EventInfo = {
            timestamp: Date.now(),
            ok: true,
            data: data,
            request_id: requestId, // Include a unique identifier for the request
            next:(timeout:number = 10*1000) => { return on(socket, `${requestId}_resp`, timeout) }
        }
        const success = socket.emit(event, event_info);
        if (success)
            resolve(event_info)
        else
            reject({timestamp:Date.now(), ok:false, error: "Unknown"})
    });
}

let socket:Socket
emit(socket, "")
    .then((e) => {console.log(`Sent: ${e}`); return e.next()})
    .then((e) => {console.log(`Received: ${e}`); return e.next()})

emit(socket, "test", {a:"1"}).then((response_event) => { console.log(response_event.data)}).then(() => {b:"2"} )