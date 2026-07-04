"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Briefcase, Users, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/shared/empty-state";
import type { JobPostingItem, CandidateItem, ApplicationItem } from "../queries/recruitment.queries";

const JOB_STATUS: Record<string, "default" | "primary" | "success" | "warning" | "destructive" | "outline" | "solid"> = {
  draft: "outline",
  open: "success",
  on_hold: "warning",
  closed: "default",
  cancelled: "destructive",
};

const STAGE_LABEL: Record<string, string> = {
  applied: "Applied",
  screening: "Screening",
  phone_screen: "Phone Screen",
  interview: "Interview",
  technical: "Technical",
  offer: "Offer",
  hired: "Hired",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
};

const STAGE_VARIANT: Record<string, "default" | "primary" | "success" | "warning" | "destructive" | "outline" | "solid"> = {
  applied: "outline",
  screening: "primary",
  phone_screen: "primary",
  interview: "warning",
  technical: "warning",
  offer: "default",
  hired: "success",
  rejected: "destructive",
  withdrawn: "outline",
};

interface Props {
  jobPostings: JobPostingItem[];
  candidates: CandidateItem[];
  applications: ApplicationItem[];
}

export function RecruitmentWorkspace({ jobPostings, candidates, applications }: Props) {
  const [search, setSearch] = useState("");

  const filteredJobs = jobPostings.filter((j) =>
    !search || j.title.toLowerCase().includes(search.toLowerCase()) ||
    (j.department?.toLowerCase().includes(search.toLowerCase()) ?? false),
  );

  const filteredCandidates = candidates.filter((c) =>
    !search || c.fullName.toLowerCase().includes(search.toLowerCase()) ||
    (c.email?.toLowerCase().includes(search.toLowerCase()) ?? false),
  );

  return (
    <Tabs defaultValue="jobs">
      <div className="flex items-center justify-between gap-4 mb-4">
        <TabsList>
          <TabsTrigger value="jobs">Job Postings</TabsTrigger>
          <TabsTrigger value="candidates">Candidates</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
        </TabsList>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <TabsContent value="jobs">
        {filteredJobs.length === 0 ? (
          <EmptyState icon={Briefcase} title="No job postings" description="No job postings have been created yet." />
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Position</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Headcount</TableHead>
                  <TableHead>Applications</TableHead>
                  <TableHead>Hired</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Closes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredJobs.map((j) => (
                  <TableRow key={j.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{j.title}</p>
                        {j.designation && <p className="text-xs text-muted-foreground">{j.designation}</p>}
                      </div>
                    </TableCell>
                    <TableCell>{j.department ?? "—"}</TableCell>
                    <TableCell>{j.location ?? "—"}</TableCell>
                    <TableCell>{j.headcount}</TableCell>
                    <TableCell>{j.applicationCount}</TableCell>
                    <TableCell className="font-medium text-teal-600">{j.hiredCount}</TableCell>
                    <TableCell>
                      <Badge variant={JOB_STATUS[j.status] ?? "default"}>
                        {j.status.replace(/_/g, " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {j.closesAt ? format(new Date(j.closesAt + "T00:00:00"), "dd MMM yyyy") : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </TabsContent>

      <TabsContent value="candidates">
        {filteredCandidates.length === 0 ? (
          <EmptyState icon={Users} title="No candidates" description="No candidates have been added yet." />
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Current Role</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Nationality</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Applications</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCandidates.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.fullName}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {c.email && <p>{c.email}</p>}
                        {c.phone && <p className="text-muted-foreground">{c.phone}</p>}
                      </div>
                    </TableCell>
                    <TableCell>{c.currentTitle ?? "—"}</TableCell>
                    <TableCell>{c.yearsExperience != null ? `${c.yearsExperience} yrs` : "—"}</TableCell>
                    <TableCell>{c.nationality ?? "—"}</TableCell>
                    <TableCell className="capitalize">{c.source ?? "—"}</TableCell>
                    <TableCell>{c.applicationCount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </TabsContent>

      <TabsContent value="pipeline">
        {applications.length === 0 ? (
          <EmptyState icon={Briefcase} title="No applications" description="No applications have been received yet." />
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidate</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Applied</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{a.candidateName}</p>
                        {a.candidateEmail && <p className="text-xs text-muted-foreground">{a.candidateEmail}</p>}
                      </div>
                    </TableCell>
                    <TableCell>{a.jobTitle}</TableCell>
                    <TableCell>
                      <Badge variant={STAGE_VARIANT[a.stage] ?? "default"}>
                        {STAGE_LABEL[a.stage] ?? a.stage}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {a.rating != null ? `${a.rating}/5` : "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(a.appliedAt), "dd MMM yyyy")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
