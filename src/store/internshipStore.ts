import { INTERNSHIPS } from "@/lib/mock-data";
import {
  Internship,
  InternshipApplication,
  InternshipApplicationStatus,
  UserProfile,
} from "@/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

function computeMatchScore(
  userSkills: string[],
  internshipSkills: string[],
  userField?: string,
  internshipField?: string
): number {
  let score = 0;
  const normalizedUser = userSkills.map((s) => s.toLowerCase());
  const normalizedInternship = internshipSkills.map((s) => s.toLowerCase());

  for (const skill of normalizedInternship) {
    if (normalizedUser.some((u) => u.includes(skill) || skill.includes(u))) {
      score += 30;
    }
  }

  if (
    userField &&
    internshipField &&
    userField.toLowerCase() === internshipField.toLowerCase()
  ) {
    score += 40;
  }

  return Math.min(100, score);
}

interface InternshipStore {
  internships: Internship[];
  applications: InternshipApplication[];

  initializeInternships: () => void;
  addInternship: (
    data: Omit<Internship, "id" | "createdAt" | "updatedAt" | "status">
  ) => Internship;
  getInternshipById: (id: string) => Internship | undefined;
  getInternshipsByCompany: (companyId: string) => Internship[];
  getOpenInternships: () => Internship[];
  applyToInternship: (params: {
    internship: Internship;
    applicant: UserProfile;
    coverLetter?: string;
    school?: string;
    degree?: string;
    documentsReady?: boolean;
  }) => InternshipApplication;
  getApplicationsByApplicant: (applicantId: string) => InternshipApplication[];
  getApplicationsByCompany: (companyId: string) => InternshipApplication[];
  getApplicationsByInternship: (internshipId: string) => InternshipApplication[];
  updateApplicationStatus: (
    id: string,
    status: InternshipApplicationStatus
  ) => void;
  getMatchingInternships: (user: UserProfile) => Internship[];
  getMatchingCandidates: (
    internship: Internship,
    candidates: UserProfile[]
  ) => UserProfile[];
}

export const useInternshipStore = create<InternshipStore>()(
  persist(
    (set, get) => ({
      internships: [],
      applications: [],

      initializeInternships: () => {
        if (get().internships.length === 0) {
          set({ internships: INTERNSHIPS as Internship[] });
        }
      },

      addInternship: (data) => {
        const internship: Internship = {
          ...data,
          id: `int_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          status: "open",
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state) => ({
          internships: [internship, ...state.internships],
        }));
        return internship;
      },

      getInternshipById: (id) =>
        get().internships.find((i) => i.id === id),

      getInternshipsByCompany: (companyId) =>
        get().internships.filter((i) => i.companyId === companyId),

      getOpenInternships: () =>
        get().internships.filter((i) => i.status === "open"),

      applyToInternship: ({
        internship,
        applicant,
        coverLetter,
        school,
        degree,
        documentsReady = false,
      }) => {
        const matchScore = computeMatchScore(
          applicant.skills,
          internship.skills,
          applicant.internshipProfile?.field,
          internship.field
        );

        const application: InternshipApplication = {
          id: `app_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          internshipId: internship.id,
          internshipTitle: internship.title,
          companyId: internship.companyId,
          companyName: internship.companyName,
          applicantId: applicant.id,
          applicantName: applicant.name,
          applicantEmail: applicant.email,
          coverLetter,
          school: school || applicant.internshipProfile?.school,
          degree: degree || applicant.internshipProfile?.degree,
          documentsReady,
          status: "applied",
          matchScore,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        set((state) => ({
          applications: [application, ...state.applications],
        }));

        return application;
      },

      getApplicationsByApplicant: (applicantId) =>
        get().applications.filter((a) => a.applicantId === applicantId),

      getApplicationsByCompany: (companyId) =>
        get().applications.filter((a) => a.companyId === companyId),

      getApplicationsByInternship: (internshipId) =>
        get().applications.filter((a) => a.internshipId === internshipId),

      updateApplicationStatus: (id, status) => {
        set((state) => ({
          applications: state.applications.map((a) =>
            a.id === id ? { ...a, status, updatedAt: new Date() } : a
          ),
        }));
      },

      getMatchingInternships: (user) => {
        const field = user.internshipProfile?.field;
        return get()
          .getOpenInternships()
          .map((internship) => ({
            internship,
            score: computeMatchScore(
              user.skills,
              internship.skills,
              field,
              internship.field
            ),
          }))
          .filter((item) => item.score >= 30)
          .sort((a, b) => b.score - a.score)
          .map((item) => item.internship);
      },

      getMatchingCandidates: (internship, candidates) => {
        return candidates
          .filter((c) => c.internshipProfile?.seekingInternship)
          .map((candidate) => ({
            candidate,
            score: computeMatchScore(
              candidate.skills,
              internship.skills,
              candidate.internshipProfile?.field,
              internship.field
            ),
          }))
          .filter((item) => item.score >= 30)
          .sort((a, b) => b.score - a.score)
          .map((item) => item.candidate);
      },
    }),
    {
      name: "masla-internships",
      partialize: (state) => ({
        internships: state.internships,
        applications: state.applications,
      }),
    }
  )
);
