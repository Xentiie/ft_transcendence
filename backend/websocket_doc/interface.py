import tkinter as tk
from tkinter import ttk
import json
import os
import typing

class WebsocketEventDataSpecs(typing.TypedDict):
    desc:str
    type:str

class WebsocketEventSpecs(typing.TypedDict):
    name:str
    desc:str
    data:typing.Dict[str, WebsocketEventDataSpecs] | WebsocketEventDataSpecs

docs: typing.Dict[ str, typing.Dict[typing.Literal["emits"] | typing.Literal["receives"], typing.List[WebsocketEventSpecs]] ] = {}

for file in os.listdir(os.getcwd()):
    if file.endswith("_doc.json"):
        socket_name = file.removesuffix("_doc.json")
        with open(file, 'r') as f:
            docs[socket_name] = json.load(f)

root = tk.Tk()
tree = ttk.Treeview(root, selectmode="browse")
event_frame = tk.Frame(root, width=100)
textbox = tk.Text(event_frame, state='disabled')
textbox.pack(expand=True, fill=tk.BOTH)

def show_item(event: tk.Event):
    if (len(tree.selection()) <= 0):
        return
    item = tree.selection()[0]
    parent_iid = tree.parent(item)
    node = []

    while parent_iid != '':
        node.insert(0, tree.item(parent_iid)['text'])
        parent_iid = tree.parent(parent_iid)
    node += [tree.item(tree.focus())["text"]]
    
    if (len(node) == 3):
        all_events_doc = docs[node[0]][node[1]]
        event_doc = None
        for x in all_events_doc:
            if (x["name"] == node[2]):
                event_doc = x
                break
        if (event_doc == None):
            print("???")
            return
        
        textbox.configure(state='normal')
        textbox.delete('1.0', tk.END)
        textbox.configure(state='disabled')
        
        if (isinstance(event_doc["data"], str)):
            data_type = None
        elif (event_doc["data"].get('type') != None):
            data_type = event_doc["data"]["type"]
            data_type = f"{{{data_type}}}"
        else:
            data_type = ''.join([f"{k}: {event_doc['data'][k]['type']}, " for k in event_doc["data"]])
            data_type = f"{{{data_type}}}"

        description = f"""{event_doc['name']} : {event_doc['desc']}


Votre code sur le frontend:

{node[0]}_socket.{"on" if node[1] == "emits" else "emit"}("{event_doc['name']}", ({f'data: {data_type}' if (data_type) else ''}) => {{
    {'console.log(data)' if (data_type) else ''}
}})
"""
        textbox.configure(state='normal')
        textbox.insert(tk.END, description)
        textbox.configure(state='disabled')
        pass

tree.bind("<Button-1>", show_item)


for websocket_name in docs:
    websocket_name_tree = tree.insert("", tk.END, text=websocket_name)

    emits_tree = tree.insert(websocket_name_tree, tk.END, text="emits")
    receives_tree = tree.insert(websocket_name_tree, tk.END, text="receives")

    for event in docs[websocket_name]["emits"]:
        tree.insert(emits_tree, tk.END, text=event["name"])
    for event in docs[websocket_name]["receives"]:
        tree.insert(receives_tree, tk.END, text=event["name"])


tree.pack(side=tk.LEFT, fill=tk.BOTH)
event_frame.pack(side=tk.RIGHT, expand=True, fill=tk.BOTH)
root.mainloop()



