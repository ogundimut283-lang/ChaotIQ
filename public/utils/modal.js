// // export function showModal(title, message) {
// //     document.getElementById("modalTitle").innerText = title;
// //     document.getElementById("modalMessage").innerText = message;
// //     document.getElementById("modalOverlay").style.display = "flex";
// // }

// // export function hideModal() {
// //     document.getElementById("modalOverlay").style.display = "none";
// // }
// export function showModal(title, message) {
//     document.getElementById("modalTitle").innerText = title;
//     document.getElementById("modalMessage").innerText = message;
//     document.getElementById("modalOverlay").style.display = "flex";
// }

// export function hideModal() {
//     document.getElementById("modalOverlay").style.display = "none";
// }

// // ⭐ Make functions global for HTML inline onclick=""
// window.showModal = showModal;
// window.hideModal = hideModal;


// // export function showPowerupModal(item, onSelectTarget) {
// //     const overlay = document.getElementById("modalOverlay");
// //     const box = document.getElementById("modalTargetBox");

// //     document.getElementById("modalTitle").innerText = item;
// //     document.getElementById("modalMessage").innerText = getItemDescription(item);

// //     // sabotage = show target selection
// //     if (onSelectTarget) {
// //         box.innerHTML = "";
// //         box.style.display = "block";

// //         currentPlayers.forEach(p => {
// //             if (p.id === mySocketId) return; // can't target self

// //             const btn = document.createElement("button");
// //             btn.className = "target-btn";
// //             btn.innerText = p.name;

// //             btn.onclick = () => {
// //                 overlay.style.display = "none";
// //                 onSelectTarget(p.id);
// //             };

// //             box.appendChild(btn);
// //         });
// //     } else {
// //         box.style.display = "none";
// //     }

// //     overlay.style.display = "flex";
// // }

// // function getItemDescription(item) {
// //     const dict = {
// //         doublePoints: "Your points this round are doubled.",
// //         hintStrong: "Shows a strong hint that helps with the question.",
// //         removeTwo: "Removes two wrong answers.",
// //         removeOne: "Removes one wrong answer.",
// //         shield: "Protects you from the next sabotage.",
// //         blur5: "Blurs someone’s screen for 5 seconds.",
// //         blur10: "Blurs someone’s screen for 10 seconds.",
// //         shake5: "Shakes someone’s screen for 5 seconds.",
// //         shake10: "Shakes someone’s screen for 10 seconds.",
// //         blackout10: "Covers someone’s screen for 10 seconds.",
// //         tinyText: "Makes someone's text tiny.",
// //         emojiSpam: "Spams emojis on someone’s screen.",
// //     };
// //     return dict[item] || "This item has an effect.";
// // }
// export function showPowerupModal(item, players, onSelect) {
//     const modal = document.getElementById("modalOverlay");
//     const title = document.getElementById("modalTitle");
//     const message = document.getElementById("modalMessage");
//     const footer = document.getElementById("modalFooter");

//     title.innerText = item.toUpperCase();
//     message.innerText = POWERUP_DESCRIPTIONS[item] || "Use this powerup.";

//     footer.innerHTML = "";

//     const sabotageItems = ["blur10","blur5","shake10","shake5","blackout10","tinyText","emojiSpam"];

//     if (sabotageItems.includes(item)) {
//         // show player targets
//         players.forEach(p => {
//             const btn = document.createElement("button");
//             btn.className = "target-btn";
//             btn.innerHTML = `${p.avatar} ${p.name}`;
//             btn.onclick = () => {
//                 hideModal();
//                 onSelect(p.id);
//             };
//             footer.appendChild(btn);
//         });
//     } else {
//         // self-only powerup
//         const btn = document.createElement("button");
//         btn.className = "ok-btn";
//         btn.innerText = "Use";
//         btn.onclick = () => {
//             hideModal();
//             onSelect(null);
//         };
//         footer.appendChild(btn);
//     }

//     modal.style.display = "flex";
// }



// export const POWERUP_DESCRIPTIONS = {
//     doublePoints: "Doubles the points you earn this round.",
//     hintStrong: "Shows a very strong hint for the correct answer.",
//     removeTwo: "Removes 2 wrong answers.",
//     shield: "Blocks the next sabotage against you.",
//     blur10: "Blurs another player's screen for 10 seconds.",
//     shake10: "Shakes another player's screen violently.",
//     blackout10: "Covers their screen completely.",
//     tinyText: "Shrinks their text to unreadable size.",
//     emojiSpam: "Covers their screen in emojis.",
//     retry: "Lets you answer again if you get it wrong."
// };
export const POWERUP_DESCRIPTIONS = {
    doublePoints: "Doubles the points you earn this round.",
    hintStrong: "Shows a very strong hint.",
    removeTwo: "Removes 2 wrong answers.",
    shield: "Blocks the next sabotage.",
    blur10: "Blurs their screen for 10 seconds.",
    shake10: "Shakes their screen violently.",
    blackout10: "Covers their screen completely.",
    tinyText: "Shrinks text to unreadable size.",
    emojiSpam: "Covers their screen in emojis.",
    retry: "Lets you retry if wrong."
};

export function showModal(title, message) {
    document.getElementById("modalTitle").innerText = title;
    document.getElementById("modalMessage").innerText = message;

    const footer = document.getElementById("modalFooter");
    footer.innerHTML = `
        <button class="ok-btn" onclick="hideModal()">OK</button>
    `;

    document.getElementById("modalOverlay").style.display = "flex";
}


export function hideModal() {
    document.getElementById("modalOverlay").style.display = "none";
}

export function showPowerupModal(item, players = [], onSelect = () => {}) {
    const modal = document.getElementById("modalOverlay");
    const title = document.getElementById("modalTitle");
    const message = document.getElementById("modalMessage");
    const footer = document.getElementById("modalFooter");

    title.innerText = item.toUpperCase();

    const sabotage = ["blur10","blur5","blackout10","tinyText"];

    if (sabotage.includes(item)) {
        message.innerText = "Choose a player to sabotage:";

        footer.innerHTML = ""; // clear old buttons

        players.forEach(p => {
            const btn = document.createElement("button");
            btn.className = "target-btn";
            btn.innerHTML = `${p.avatar} ${p.name}`;
            btn.onclick = () => {
                hideModal();
                onSelect(p.id);
            };
            footer.appendChild(btn);
        });

    } else {
        message.innerText = POWERUP_DESCRIPTIONS[item] || "Use this powerup.";

        footer.innerHTML = `
            <button class="ok-btn" onclick="hideModal()">Use</button>
        `;
    }

    modal.style.display = "flex";
}


// allow HTML inline onclick=""
window.showModal = showModal;
window.hideModal = hideModal;
