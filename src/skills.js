export function renderSkillPieChart(skill, container) {
    const size = 120;
    const radius = size / 2 - 10;
    const circumference = 2 * Math.PI * radius;
    const percent = skill.level * 100;

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", size);
    svg.setAttribute("height", size);

    const bgCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    bgCircle.setAttribute("cx", size / 2);
    bgCircle.setAttribute("cy", size / 2);
    bgCircle.setAttribute("r", radius);
    bgCircle.setAttribute("stroke", "#e5e7eb");
    bgCircle.setAttribute("stroke-width", "10");
    bgCircle.setAttribute("fill", "none");
    svg.appendChild(bgCircle);

    const progressCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    progressCircle.setAttribute("cx", size / 2);
    progressCircle.setAttribute("cy", size / 2);
    progressCircle.setAttribute("r", radius);
    progressCircle.setAttribute("stroke", "#4ade80");
    progressCircle.setAttribute("stroke-width", "10");
    progressCircle.setAttribute("fill", "none");
    progressCircle.setAttribute("stroke-dasharray", circumference);
    progressCircle.setAttribute("stroke-dashoffset", circumference);
    progressCircle.style.transition = "stroke-dashoffset 1.2s ease-in-out";
    svg.appendChild(progressCircle);

    setTimeout(() => {
        progressCircle.style.strokeDashoffset = circumference * (1 - skill.level);
    }, 100);

    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", size / 2);
    text.setAttribute("y", size / 2 + 5);
    text.setAttribute("text-anchor", "middle");
    text.style.fontSize = "18px";
    text.style.fill = "#111827";
    text.textContent = `${percent.toFixed(0)}%`;
    svg.appendChild(text);

    container.appendChild(svg);
}
