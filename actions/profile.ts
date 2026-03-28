"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const MAX_FIELD_LENGTH = 100;

export type ProfileData = {
  firstName: string;
  lastName: string;
  specialty: string;
  documentUrl?: string;
};

function validateProfileData(
  data: ProfileData
): { field: string; message: string } | null {
  if (!data.firstName?.trim())
    return { field: "firstName", message: "First name is required." };
  if (data.firstName.trim().length > MAX_FIELD_LENGTH)
    return { field: "firstName", message: "First name is too long." };
  if (!data.lastName?.trim())
    return { field: "lastName", message: "Last name is required." };
  if (data.lastName.trim().length > MAX_FIELD_LENGTH)
    return { field: "lastName", message: "Last name is too long." };
  if (!data.specialty?.trim())
    return { field: "specialty", message: "Specialty is required." };
  return null;
}

export async function saveProfile(data: ProfileData) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const validationError = validateProfileData(data);
  if (validationError) {
    throw new Error(validationError.message);
  }

  const userId = session.user.id;

  return prisma.profile.upsert({
    where: { userId },
    update: {
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      specialty: data.specialty.trim(),
      ...(data.documentUrl ? { documentUrl: data.documentUrl } : {}),
    },
    create: {
      userId,
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      specialty: data.specialty.trim(),
      documentUrl: data.documentUrl ?? null,
    },
  });
}

export async function getProfile() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return null;
  }

  return prisma.profile.findUnique({
    where: { userId: session.user.id },
  });
}
