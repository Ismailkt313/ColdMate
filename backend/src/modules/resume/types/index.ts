export interface IParsedResume {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  skills: string[];
  experience: {
    company: string;
    title: string;
    startDate: string;
    endDate: string;
    description: string;
  }[];
  education: {
    institution: string;
    degree: string;
    field: string;
    startDate: string;
    endDate: string;
  }[];
  projects: {
    name: string;
    description: string;
    technologies: string[];
    url: string;
  }[];
  certifications: {
    name: string;
    issuer: string;
    date: string;
  }[];
  achievements: string[];
  languages: string[];
  preferredRoles: string[];
}

export interface IResume {
  _id: string;
  userId: string;
  resumeName: string;
  resumeUrl: string;
  resumePublicId: string;
  extractedText: string;
  parsedData: IParsedResume;
  status: string;
  fileSize: number;
  createdAt: Date;
  updatedAt: Date;
}
