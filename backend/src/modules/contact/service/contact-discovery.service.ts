import { IContactDiscoveryService } from "../interface/contact.service.interface";
import { IContact } from "../types";
import { AIService } from "../../../services/ai.service";



interface ExtractedData {
  text: string;
  links: string[];
  emails: string[];
  phones: string[];
  linkedins: string[];
  githubs: string[];
}

export class ContactDiscoveryService implements IContactDiscoveryService {
  async discover(
    companyName: string,
    website?: string,
    aiResearchContext?: any,
    mode: "standard" | "deep" = "standard"
  ): Promise<IContact[]> {
    if (!website) {
      console.warn("No website URL provided for crawling. Proceeding with database research context only.");
    }

    const startUrl = website ? (website.startsWith("http") ? website : `https://${website}`) : null;
    const pagesContent: { url: string; text: string }[] = [];
    const allEmails = new Set<string>();
    const allPhones = new Set<string>();
    const allLinkedins = new Set<string>();
    const allGithubs = new Set<string>();

    if (startUrl) {
      console.log(`[Crawler] Starting crawl at homepage: ${startUrl} (${mode} mode)`);
      const homepageData = await this.fetchPageTextAndLinks(startUrl);
      
      if (homepageData.text) {
        pagesContent.push({ url: startUrl, text: homepageData.text });
        homepageData.emails.forEach(e => allEmails.add(e));
        homepageData.phones.forEach(p => allPhones.add(p));
        homepageData.linkedins.forEach(l => allLinkedins.add(l));
        homepageData.githubs.forEach(g => allGithubs.add(g));

        // Filter and collect prioritized links
        const keywords = mode === "deep" 
          ? ["careers", "jobs", "contact", "about", "team", "people", "leadership", "engineering", "press", "news"]
          : ["careers", "jobs", "contact", "about"];
        
        const sublinks = this.findTargetSublinks(homepageData.links, keywords);
        const maxSublinks = mode === "deep" ? 8 : 3;
        const targetLinks = sublinks.slice(0, maxSublinks);

        console.log(`[Crawler] Found sublinks to scan:`, targetLinks);

        // Fetch subpages in parallel with standard limits
        const subpagePromises = targetLinks.map(async (url) => {
          const subData = await this.fetchPageTextAndLinks(url);
          if (subData.text) {
            pagesContent.push({ url, text: subData.text });
            subData.emails.forEach(e => allEmails.add(e));
            subData.phones.forEach(p => allPhones.add(p));
            subData.linkedins.forEach(l => allLinkedins.add(l));
            subData.githubs.forEach(g => allGithubs.add(g));
          }
        });

        await Promise.all(subpagePromises);
      }
    }

    // Compile crawl database
    const crawlContext = {
      companyName,
      website: website || "",
      collectedEmails: Array.from(allEmails),
      collectedPhones: Array.from(allPhones),
      collectedLinkedins: Array.from(allLinkedins),
      collectedGithubs: Array.from(allGithubs),
      researchIntelligence: aiResearchContext ? JSON.stringify(aiResearchContext).substring(0, 3000) : "",
      extractedPageSnippets: pagesContent.map(p => ({
        url: p.url,
        text: p.text.substring(0, mode === "deep" ? 1500 : 800), // restrict length to prevent token overflow
      })),
    };

    const systemPrompt =
      "You are a strict data extraction auditor. " +
      "You are given visible texts and candidates scraped from public domains of the company. " +
      "Your job is to structure and extract valid target contacts. " +
      "You must return ONLY valid JSON matching the exact schema requested. Do not include markdown fences, backticks, or text before/after.";

    const userPrompt = `
Analyze this crawled public dataset for the company: "${companyName}":
---
${JSON.stringify(crawlContext)}
---

Extract standard contact categories involved in recruiting, executive leadership, or engineering departments:
- Recruiting / Talent Acquisition / HR
- Hiring Managers / Department Leads
- Engineering Managers / Tech Leads
- Founders / Executive Leadership
- Support / Careers generic contacts (e.g. careers@company.com)

Return a structured JSON list matching this exact schema:
{
  "contacts": [
    {
      "name": "Full Name of Contact (or General Contact if no specific name)",
      "role": "Job Title / Role (e.g. HR Recruiter, CTO, Engineering Lead)",
      "department": "Engineering / HR / Sales / Executive / General",
      "email": "email@domain.com (or null if not found in crawled text)",
      "phone": "+1... (or null if not found in crawled text)",
      "linkedin": "https://linkedin.com/in/... (or null if not found in crawled text)",
      "sourceUrl": "Specific subpage URL where this contact or email was extracted",
      "sourceType": "OFFICIAL_WEBSITE" | "CAREERS_PAGE" | "LINKEDIN" | "PUBLIC_DIRECTORY" | "PRESS_RELEASE" | "OTHER",
      "confidence": 0-100,
      "reason": "Justification for extraction and score assignment details"
    }
  ]
}

Confidence Score Rules:
- 95-100: Found on official website contact/about pages
- 90-95: Found on official careers pages
- 85-90: Found in official LinkedIn URL structures
- 70-85: Found in public directories or news releases
- Below 70: Weak match

Strict Rules:
1. NEVER fabricate email addresses, names, or phone numbers. If you do not see a verified email or phone, set it to null. Do NOT guess domain structures.
2. Only extract contacts that are explicitly present or can be directly supported by the scraped visibility text context.
3. If no contacts are found in the provided context, return:
{
  "contacts": []
}
`;

    try {
      const raw = await AIService.generateText(systemPrompt + "\n\n" + userPrompt);
      return this.parseDiscoveryJson(raw);
    } catch (err) {
      console.error("AI contact discovery failed:", err);
      return [];
    }
  }

  private async fetchPageTextAndLinks(url: string): Promise<ExtractedData> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        },
      });

      clearTimeout(timeoutId);
      const html = String(await response.text() || "");
      
      // Strip script and style tags to parse visible text content
      const cleanText = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      // Scan email matches
      const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
      const emails = Array.from(new Set(html.match(emailRegex) || []));

      // Scan phone numbers
      const phoneRegex = /\+?[0-9]{1,4}?[-.\s]?\(?[0-9]{1,3}?\)?[-.\s]?[0-9]{1,4}[-.\s]?[0-9]{1,4}[-.\s]?[0-9]{1,9}/g;
      const phones = Array.from(new Set(html.match(phoneRegex) || []))
        .filter(p => p.length >= 7 && p.length <= 15);

      // Scan LinkedIn profiles
      const linkedinRegex = /linkedin\.com\/(?:in|company)\/[a-zA-Z0-9-_]+/gi;
      const linkedins = Array.from(new Set(html.match(linkedinRegex) || []))
        .map(link => "https://" + link.toLowerCase());

      // Scan GitHub organizations
      const githubRegex = /github\.com\/[a-zA-Z0-9-_]+/gi;
      const githubs = Array.from(new Set(html.match(githubRegex) || []))
        .map(link => "https://" + link.toLowerCase());

      // Extract internal links to find subpages
      const hrefRegex = /href=["'](https?:\/\/[^"']+|(?:\/[a-zA-Z0-9-_]+)+)/gi;
      const matches = Array.from(html.matchAll(hrefRegex));
      const baseUrl = new URL(url).origin;
      const linksSet = new Set<string>();

      for (const match of matches) {
        let link = match[1];
        if (link.startsWith("/")) {
          link = baseUrl + link;
        }
        try {
          const u = new URL(link);
          if (
            u.host === new URL(url).host && 
            !link.includes("#") && 
            !link.endsWith(".png") && 
            !link.endsWith(".jpg") && 
            !link.endsWith(".pdf")
          ) {
            linksSet.add(link);
          }
        } catch {}
      }

      return {
        text: cleanText,
        links: Array.from(linksSet),
        emails,
        phones,
        linkedins,
        githubs,
      };
    } catch (err) {
      console.warn(`Failed to crawl url ${url}:`, err instanceof Error ? err.message : err);
      return { text: "", links: [], emails: [], phones: [], linkedins: [], githubs: [] };
    }
  }

  private findTargetSublinks(links: string[], keywords: string[]): string[] {
    return links.filter(link => {
      try {
        const path = new URL(link).pathname.toLowerCase();
        return keywords.some(keyword => path.includes(keyword));
      } catch {
        return false;
      }
    });
  }

  private parseDiscoveryJson(raw: string): IContact[] {
    const cleaned = raw
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();

    try {
      const parsed = JSON.parse(cleaned);
      const list = Array.isArray(parsed) ? parsed : (parsed.contacts || []);
      
      if (Array.isArray(list)) {
        return list
          .map((item: any) => ({
            fullName: String(item.name || item.fullName || "").trim(),
            jobTitle: String(item.role || item.jobTitle || "").trim(),
            department: String(item.department || "").trim(),
            email: item.email ? String(item.email).trim() : undefined,
            phone: item.phone ? String(item.phone).trim() : undefined,
            linkedin: item.linkedin ? String(item.linkedin).trim() : undefined,
            sourceUrl: String(item.sourceUrl || "").trim(),
            sourceType: ["OFFICIAL_WEBSITE", "CAREERS_PAGE", "LINKEDIN", "PUBLIC_DIRECTORY", "PRESS_RELEASE", "OTHER"].includes(item.sourceType)
              ? item.sourceType
              : "OTHER",
            confidenceScore: typeof item.confidence === "number" ? item.confidence : (typeof item.confidenceScore === "number" ? item.confidenceScore : 50),
            aiNotes: String(item.reason || item.aiNotes || "").trim(),
            validationStatus: "UNVERIFIED" as const,
          }))
          .filter((item: any) => item.fullName.length > 0);
      }
      return [];
    } catch {
      return [];
    }
  }
}
