# How to run this every time

Same steps every time you get a new zip from me. Takes under a minute.

## 1. Unzip it
Right-click the `.zip` → **Extract All**. If a folder with the same name
already exists, Windows will name the new one `isl-translator-react (1)` or
similar — note the exact name.

## 2. Open a terminal INSIDE the project folder
Don't open the terminal separately and `cd` by typing — it's easy to end up
one folder too high or too low (this has happened before). Instead:

1. In **File Explorer**, open folders until you can see `package.json`
   sitting directly in the folder view (not inside another subfolder).
2. Click the address bar at the top of File Explorer, type `cmd`, press Enter.
   A terminal opens already inside the correct folder.

(If you're not sure whether you're in the right place, run
`dir package.json` — if it prints file info, you're in the right folder;
if it says "File Not Found", go up or down a folder and try again.)

## 3. Install and run
```powershell
npm install
npm run dev
```

`npm install` only needs to be run again if I tell you dependencies changed.
`npm run dev` you'll run every time — leave that terminal window open while
you use the app.

## 4. Open the app
The terminal will print something like:
```
  ➜  Local:   http://localhost:5173/
```
Open that address in Chrome or Edge.

## 5. Getting a NEW version from me later
Each time I give you an updated zip:
1. Stop the running server (click the terminal, press `Ctrl+C`).
2. Delete the old project folder (or rename it, e.g. `-old`, if you want to
   keep it as backup).
3. Unzip the new one, and repeat steps 2–4 above.

If `npm install` ever fails partway or `npm run dev` errors out, screenshot
the full terminal output (scroll up if needed) and send it — that error text
tells me exactly what's wrong.
