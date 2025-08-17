"use server"
import { CronJob } from "@prisma/client";
import { prisma } from "./prisma";

// Fetch all
export async function fetchAllCronJobsDB() {
    return prisma.cronJob.findMany({
        orderBy: { id: "asc" },
    });
}

// Create
export async function createCronJobDB(
    name: string,
    schedule: string,
    command: string,
    status: string,
    fileUrl: string | null) {
    return prisma.cronJob.create({
        data: {
            name: name,
            schedule: schedule,
            command: command,
            status: status,
            fileUrl:fileUrl
        },
    });
}

// Update
export async function updateCronJobDB(
  id: number,
  name: string,
  schedule: string,
  command: string,
  status: string,
  fileUrl: string | null
): Promise<CronJob> {
  return await prisma.cronJob.update({
    where: { id },
    data: {
      name,
      schedule,
      command,
      status,
      fileUrl
    },
  });
}


// Delete

export async function deleteCronJobDB(id: number): Promise<CronJob> {
  return await prisma.cronJob.delete({
    where: { id },
  });
}