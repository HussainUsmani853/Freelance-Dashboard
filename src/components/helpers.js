export const formatTime = (seconds) => {
  const hours = String(Math.floor(seconds / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");
  return `${hours}:${minutes}:${secs}`;
};

export const formatLoggedTime = (totalSeconds) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
};

export const addLoggedTime = (existingTime, newTime) => {
  const parseTime = (time) => {
    const [daysMatch, hoursMatch, minutesMatch] = [
      /(\d+)d/.exec(time),
      /(\d+)h/.exec(time),
      /(\d+)m/.exec(time),
    ];
    return {
      days: daysMatch ? parseInt(daysMatch[1]) : 0,
      hours: hoursMatch ? parseInt(hoursMatch[1]) : 0,
      minutes: minutesMatch ? parseInt(minutesMatch[1]) : 0,
    };
  };

  const {
    days: exDays,
    hours: exHours,
    minutes: exMinutes,
  } = parseTime(existingTime);

  const {
    days: newDays,
    hours: newHours,
    minutes: newMinutes,
  } = parseTime(newTime);

  let totalMinutes = exMinutes + newMinutes;
  let totalHours = exHours + newHours + Math.floor(totalMinutes / 60);
  let totalDays = exDays + newDays + Math.floor(totalHours / 24);

  totalMinutes %= 60;
  totalHours %= 24;

  const formattedTime = [];
  if (totalDays > 0) formattedTime.push(`${totalDays}d`);
  if (totalHours > 0 || totalDays > 0) formattedTime.push(`${totalHours}h`);
  formattedTime.push(`${totalMinutes}m`);

  return formattedTime.join(" ");
};

export const logTimeForTasks = async (selectedTaskIds, formattedLoggedTime, supabase) => {
  try {
    const { data, error } = await supabase
      .from("tasks")
      .select("id, timeSpent")
      .in("id", selectedTaskIds); // Fetch time for multiple tasks

    if (error && error.code !== "PGRST116") {
      throw error; // Rethrow error if it's not "No rows returned"
    }

    const updates = (data || []).map((task) => {
      const existingTimeSpent = task.timeSpent || "0h 0m";
      const updatedTimeSpent = addLoggedTime(
        existingTimeSpent,
        formattedLoggedTime
      );
      return { id: task.id, timeSpent: updatedTimeSpent };
    });

    // Update the database with the new `timeSpent` for the selected tasks
    const { error: updateError } = await supabase
      .from("tasks")
      .upsert(updates, {
        onConflict: ["id"], // Ensure upsert is specific to tasks
      });

    if (updateError) throw updateError;

    console.log("Time logged successfully for tasks:", updates);
  } catch (err) {
    console.error("Error logging time for tasks:", err.message);
  }
};
