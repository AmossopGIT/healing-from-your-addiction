import { getCaseStudiesByAddiction, type CaseStudy } from "@/content/caseStudies";

export type IntakeQuestion = {
  id: string;
  text: string;
};

export type IntakeQuestionSection = {
  title: string;
  questions: IntakeQuestion[];
};

export type IntakeQuestionSet = {
  slug: string;
  title: string;
  sections: IntakeQuestionSection[];
};

const INTAKE_SECTION_PATTERN = /^\d+\./;

export function isIntakeQuestionSection(title: string) {
  return INTAKE_SECTION_PATTERN.test(title.trim());
}

export function buildIntakeQuestionSet(study: CaseStudy): IntakeQuestionSet {
  const sections: IntakeQuestionSection[] = [];

  study.sections.forEach((section, sectionIndex) => {
    if (!section.bullets?.length || !isIntakeQuestionSection(section.h2)) {
      return;
    }

    sections.push({
      title: section.h2,
      questions: section.bullets.map((text, questionIndex) => ({
        id: `${sectionIndex}-q-${questionIndex}`,
        text,
      })),
    });
  });

  return {
    slug: study.slug,
    title: study.h1,
    sections,
  };
}

export function getIntakeQuestionSetForAddiction(addictionSlug: string): IntakeQuestionSet | null {
  const study = getCaseStudiesByAddiction(addictionSlug).find((item) => item.caseStudyType === "questions");
  return study ? buildIntakeQuestionSet(study) : null;
}

export function flattenIntakeQuestions(questionSet: IntakeQuestionSet) {
  return questionSet.sections.flatMap((section) => section.questions);
}

export function countAnsweredQuestions(responses: Record<string, string>, questionSet: IntakeQuestionSet) {
  const questions = flattenIntakeQuestions(questionSet);
  const answered = questions.filter((question) => (responses[question.id] ?? "").trim().length > 0).length;
  return { answered, total: questions.length };
}
