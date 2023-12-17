import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom/client";

import { useLocalStorage } from "react-use";
import { exec } from "node:child_process";

function saveToKeyboard(p) {
  const profileButton = document.querySelector(`#app > div > div:nth-child(3) > div.main.flex > div.main-left > div.main-left-list.scroll-bar > div:nth-child(${p.profile + 1}) > span`);
  if(profileButton) profileButton.click();

  const saveButton = document.querySelector("#app > div > div.box-top.flex.fcenter.fvertical.between > div.box-top-right.flex.fvertical > div.box-top-right-serach");
  if(saveButton) saveButton.click();

  const turboButton = document.querySelector("#app > div > div:nth-child(3) > div.footer.flex > div.footer-left > div:nth-child(1) > div > div.el-switch");
  if(turboButton) {
    const currentTurboMode = !!turboButton.ariaChecked;
    if(currentTurboMode !== p.turbo) setTimeout(() => turboButton.children[1].click(), 500);
  }

  const rapidtriggerButton = document.querySelector("#app > div > div:nth-child(3) > div.footer.flex > div.footer-left > div:nth-child(2) > div > div.el-switch");
  if(rapidtriggerButton) {
    const currentRapidTriggerMode = !!rapidtriggerButton.ariaChecked;
    if(currentRapidTriggerMode !== p.rapidtrigger) setTimeout(() => rapidtriggerButton.children[1].click(), 1000);
  } 

  console.log("Saved to keyboard");
}

function getPerfProfiles() {
  let s = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.substring(0, 15) === "ddeerA75Profile") {
      s[parseInt(key.substring(15)) - 1] = JSON.parse(localStorage.getItem(key));
    }
  }
  return s;
}

function Panel(props) {
  const [perfProfiles, setPerfProfiles] = useState(getPerfProfiles());
  const [profiles, setProfiles] = useLocalStorage("applicationProfile");
  const [runnningApp, setRunningApp] = useState(0);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const id = setInterval(() => {
      setPerfProfiles(getPerfProfiles());
      
      exec("tasklist", (err, stdout, stderr) => {
        if (err) return;
        const lowerStdout = stdout.toLowerCase();
        for (let i = 1; i < profiles.length; i++) {
          const appName = profiles[i].name;
          const isRunning = lowerStdout.indexOf(appName.toLowerCase()) > -1;
          if (isRunning) {
            setRunningApp(i);
            return;
          }
        }
        setRunningApp(0);
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    console.log(`Running ${profiles[runnningApp].name}`);
    saveToKeyboard(profiles[runnningApp]);
  }, [runnningApp]);

  const addExe = (event) => {
    const file = event.target.files[0];
    const profile = {
      name: file.name,
      path: file.path,
      profile: 0,
      turbo: false,
      rapidtrigger: false
    }
    profiles.push(profile);
    setProfiles([...profiles]);
    fileInputRef.current.value = null;
  }

  const deleteExe = (index) => {
    profiles.splice(index, 1);
    setProfiles([...profiles]);
  }

  return (
    <>
      <div className="footer-left-item">
        <div className="footer-left-item-title">Application Profile (Unofficial feature)</div>
        <div className="app-list flex">
          <div className="profile-list">
            {profiles.map((profile, index) =>
              <div key={index} className={`app-list-item ${runnningApp === index && "running"}`}>
                <div className="app-list-item-title">{profile.name}</div>
                <div className="app-list-item-option">
                  <span>Performance Profile</span>
                  <select value={profiles[index].profile} onChange={(e) => {
                    profiles[index].profile = parseInt(e.target.value);
                    setProfiles([...profiles]);
                  }}>
                    {perfProfiles.map((p, i) => <option key={i} value={i}>{p.showname}</option>)}
                  </select>
                </div>
                <div className="app-list-item-option">
                  <span>Turbo Mode</span>
                  <input type="checkbox" checked={profiles[index].turbo} onChange={(e) => {
                    profiles[index].turbo = e.target.checked;
                    setProfiles([...profiles]);
                  }}/>
                </div>
                <div className="app-list-item-option">
                  <span>Rapid Trigger Mode(All Keys)</span>
                  <input type="checkbox" checked={profiles[index].rapidtrigger} onChange={(e) => {
                    profiles[index].rapidtrigger = e.target.checked;
                    setProfiles([...profiles]);
                  }}/>
                </div>
                {profile.name !== "Default" && <div className="app-list-item-option delete-button" onClick={() => deleteExe(index)}>
                  <span>Delete</span>
                </div>}
              </div>
            )}
          </div>
          <div className="app-list-item add-button" onClick={() => fileInputRef.current.click()}>
            <input type="file" accept=".exe" ref={fileInputRef} onChange={addExe} />
            <div className="app-list-item-option">
              <span><i className="el-icon-plus"></i> Add Application</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .footer-left-item {
          padding-left: 2.0rem;
        }

        .running {
          border: 2px solid #ed6d57;
        }

        .app-list-item {
          background-color: #8c8c8c;
          border-radius: 0.05rem;
          width: 1.5rem;
          height: 0.9rem;
          margin: 0.1rem 0.04rem;
          padding: 0.1rem;
        }
      
        .app-list-item-title {
          font-size: 0.12rem;
          margin-bottom: 0.1rem;
        }
      
        .app-list-item-option {
          font-size: 0.072rem;
          margin-bottom: 0.05rem;
          width: 100%;
          display: flex;
          justify-content: space-between;
        }
      
        .profile-list {
          display: flex;
        }
      
        .add-button {
          width: 0.65rem;
          background-color: #656565;
          display: flex;
          justify-content: center;
          align-items: center;
          cursor: pointer;
        }
      
        .add-button > input {
          display: none;
        }

        .delete-button {
          cursor: pointer;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 0.05rem 0px;
          background-color: #484848;
        }

        .el-switch__core {
          width: 40px;
          border-color: rgb(65, 65, 65);
          background-color: rgb(65, 65, 65);
        }

      `}</style>
    </>
  );
}

if (localStorage.getItem("applicationProfile") == null) {
  localStorage.setItem("applicationProfile", JSON.stringify([{ name: "Default", path: null, profile: null, turbo: false, rapidtrigger: false }]));
}

let s = [];
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  if (key.substring(0, 15) === "ddeerA75Profile") {
    s[parseInt(key.substring(15)) - 1] = JSON.parse(localStorage.getItem(key));
  }
}
localStorage.setItem("perfProfiles", JSON.stringify(s));

const box = document.getElementsByClassName("box")[0];
const panel = box.appendChild(document.createElement("div"));
panel.className = "footer-left";
panel.style = `
  width: 100%;
  border-bottom: 1px solid #383838;
`;

const root = ReactDOM.createRoot(panel);
root.render(<Panel />);