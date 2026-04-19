const monthFormatter = new Intl.DateTimeFormat("pt-BR", { month: "short" });

function toMonthStart(dateText) {
    const date = new Date(dateText + "T00:00:00");
    return new Date(date.getFullYear(), date.getMonth(), 1);
}

function toMonthEnd(dateText) {
    const date = new Date(dateText + "T00:00:00");
    return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
}

function clampDate(value, min, max) {
    return new Date(Math.min(Math.max(value.getTime(), min.getTime()), max.getTime()));
}

function dateToPercent(date, globalStart, globalEnd) {
    const clamped = clampDate(date, globalStart, globalEnd);
    const total = globalEnd.getTime() - globalStart.getTime();
    if (total <= 0) {
        return 0;
    }

    return ((clamped.getTime() - globalStart.getTime()) / total) * 100;
}

function addSegment(track, cssClass, startDate, endDate, globalStart, globalEnd) {
    if (endDate <= startDate) {
        return;
    }

    const left = dateToPercent(startDate, globalStart, globalEnd);
    const right = dateToPercent(endDate, globalStart, globalEnd);
    const width = right - left;

    if (width <= 0) {
        return;
    }

    const segment = document.createElement("div");
    segment.className = "segment " + cssClass;
    segment.style.left = left + "%";
    segment.style.width = width + "%";
    track.appendChild(segment);
}

function buildMonthList(schedule) {
    const starts = schedule.map((item) => toMonthStart(item.start));
    const ends = schedule.map((item) => item.actualEnd ? toMonthEnd(item.actualEnd) : toMonthEnd(item.end));

    const minDate = new Date(Math.min(...starts.map((date) => date.getTime())));
    const maxDate = new Date(Math.max(...ends.map((date) => date.getTime())));

    const months = [];
    const cursor = new Date(minDate.getFullYear(), minDate.getMonth(), 1);

    while (cursor <= maxDate) {
        months.push(new Date(cursor));
        cursor.setMonth(cursor.getMonth() + 1);
    }

    return months;
}

function renderCurrentTimeMarker(elements, globalStart, globalEnd) {
    const { currentTimeMarker, taskTableBody, taskTableContent } = elements;
    if (!currentTimeMarker || !taskTableContent) {
        return;
    }

    const firstTrack = taskTableBody?.querySelector(".timeline-track");
    if (!firstTrack) {
        currentTimeMarker.style.display = "none";
        return;
    }

    const markerPercent = dateToPercent(new Date(), globalStart, globalEnd) / 100;
    const contentRect = taskTableContent.getBoundingClientRect();
    const trackRect = firstTrack.getBoundingClientRect();
    const markerLeft = (trackRect.left - contentRect.left) + (trackRect.width * markerPercent);

    currentTimeMarker.style.left = markerLeft + "px";
    currentTimeMarker.style.display = "block";
}

export function renderTimeline(schedule, elements) {
    const { taskTableBody, taskTableHeadRow, taskMonthNote } = elements;
    if (!taskTableBody || !taskTableHeadRow || !taskMonthNote) {
        return;
    }

    const now = new Date();
    const months = buildMonthList(schedule);
    const globalStart = months[0];
    const lastMonth = months[months.length - 1];
    const globalEnd = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0, 23, 59, 59);
    const currentDate = clampDate(now, globalStart, globalEnd);

    taskTableHeadRow.innerHTML = '<th class="task-name-col">Tarefa</th><th>Cronograma</th>';
    const scale = document.createElement("div");
    scale.className = "timeline-scale";

    months.forEach((month) => {
        const label = document.createElement("span");
        label.className = "scale-month";
        label.textContent = monthFormatter.format(month).replace(".", "");

        const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
        if (monthStart > now) {
            label.classList.add("future");
        }

        scale.appendChild(label);
    });

    taskTableHeadRow.children[1].appendChild(scale);

    taskTableBody.innerHTML = "";
    schedule.forEach((item) => {
        const row = document.createElement("tr");

        const taskCell = document.createElement("td");
        taskCell.textContent = item.task;
        row.appendChild(taskCell);

        const timelineCell = document.createElement("td");
        const track = document.createElement("div");
        track.className = "timeline-track";

        const taskStart = new Date(item.start + "T00:00:00");
        const taskEnd = new Date(item.end + "T23:59:59");
        const actualEnd = item.actualEnd ? new Date(item.actualEnd + "T23:59:59") : null;
        const visualEnd = actualEnd || taskEnd;

        const futureStart = currentDate < taskStart ? taskStart : currentDate;
        if (futureStart < visualEnd) {
            addSegment(track, "future", futureStart, visualEnd, globalStart, globalEnd);
        }

        if (currentDate > taskStart) {
            if (actualEnd) {
                const doneEnd = clampDate(taskEnd, taskStart, currentDate);
                addSegment(track, "done", taskStart, doneEnd, globalStart, globalEnd);

                const delayEnd = clampDate(actualEnd, taskStart, currentDate);
                if (delayEnd > taskEnd) {
                    addSegment(track, "delay", taskEnd, delayEnd, globalStart, globalEnd);
                }
            } else {
                const activeEnd = clampDate(currentDate, taskStart, taskEnd);
                addSegment(track, "active", taskStart, activeEnd, globalStart, globalEnd);
            }
        }

        timelineCell.appendChild(track);
        row.appendChild(timelineCell);
        taskTableBody.appendChild(row);
    });

    renderCurrentTimeMarker(elements, globalStart, globalEnd);
}
