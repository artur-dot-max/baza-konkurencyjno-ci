"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { FileDropzone, type UploadedFile } from "@/components/ui/file-dropzone";
import { cn, VOIVODESHIPS } from "@/lib/utils";
import {
  announcementStep1Schema,
  announcementStep2Schema,
  announcementStep3Schema,
  announcementStep4Schema,
  announcementStep5Schema,
  announcementStep6Schema,
} from "@/lib/validators";

const STEPS = [
  "Dane podstawowe",
  "Przedmiot zamówienia",
  "Warunki udziału",
  "Kryteria oceny",
  "Terminy",
  "Kontakt i załączniki",
  "Podsumowanie",
];

export default function NewAnnouncementPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State for form data
  const [formData, setFormData] = useState({
    procedureNumber: `ZAP/${new Date().getFullYear()}/${Math.floor(Math.random() * 1000)}`,
    title: "",
    orderType: "",
    voivodeship: "",
    location: "",
    executionTerm: "",
    description: "",
    conditions: "",
    criteria: [{ name: "Cena", weight: 100 }],
    publishedAt: "",
    bidsDeadline: "",
    contactPerson: "",
    contactEmail: "",
    contactPhone: "",
    submissionMethod: "",
    attachmentIds: [] as string[],
  });

  const handleFilesChange = (files: UploadedFile[]) => {
    setUploadedFiles(files);
    updateFormData(
      "attachmentIds",
      files.map((f) => f.id).filter(Boolean) as string[]
    );
  };

  const validateStep = (stepToValidate: number): string | null => {
    const inputs = [
      { schema: announcementStep1Schema, data: formData },
      { schema: announcementStep2Schema, data: formData },
      { schema: announcementStep3Schema, data: formData },
      { schema: announcementStep4Schema, data: formData },
      { schema: announcementStep5Schema, data: formData },
      { schema: announcementStep6Schema, data: formData },
    ];
    if (stepToValidate >= inputs.length) return null;
    const result = inputs[stepToValidate].schema.safeParse(inputs[stepToValidate].data);
    return result.success ? null : result.error.issues[0]?.message ?? "Uzupełnij wymagane pola.";
  };

  const goToNextStep = () => {
    const validationError = validateStep(step);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setStep((current) => Math.min(STEPS.length - 1, current + 1));
  };

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addCriterion = () => {
    setFormData((prev) => ({
      ...prev,
      criteria: [...prev.criteria, { name: "", weight: 0 }],
    }));
  };

  const updateCriterion = (index: number, field: string, value: any) => {
    const newCriteria = [...formData.criteria];
    newCriteria[index] = { ...newCriteria[index], [field]: value };
    setFormData((prev) => ({ ...prev, criteria: newCriteria }));
  };

  const removeCriterion = (index: number) => {
    const newCriteria = [...formData.criteria];
    newCriteria.splice(index, 1);
    setFormData((prev) => ({ ...prev, criteria: newCriteria }));
  };

  const handleSubmit = async (status: "DRAFT" | "PUBLISHED") => {
    for (let index = 0; index < STEPS.length - 1; index++) {
      const validationError = validateStep(index);
      if (validationError) {
        setStep(index);
        setError(validationError);
        return;
      }
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, status }),
      });

      if (res.ok) {
        if (status === "DRAFT") {
          router.push("/panel/szkice");
        } else {
          router.push("/panel/ogloszenia");
        }
      } else {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "Nie udało się utworzyć ogłoszenia.");
      }
    } catch (error) {
      console.error(error);
      setError("Nie udało się połączyć z serwerem.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="procedureNumber">Numer postępowania</Label>
              <Input
                id="procedureNumber"
                value={formData.procedureNumber}
                onChange={(e) => updateFormData("procedureNumber", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Tytuł zamówienia</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => updateFormData("title", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="orderType">Rodzaj zamówienia</Label>
              <Select
                value={formData.orderType}
                onValueChange={(val) => updateFormData("orderType", val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz rodzaj" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SUPPLIES">Dostawy</SelectItem>
                  <SelectItem value="SERVICES">Usługi</SelectItem>
                  <SelectItem value="CONSTRUCTION">Roboty budowlane</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="voivodeship">Województwo</Label>
              <Select
                value={formData.voivodeship}
                onValueChange={(val) => updateFormData("voivodeship", val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz województwo" />
                </SelectTrigger>
                <SelectContent>
                  {VOIVODESHIPS.map((v) => (
                    <SelectItem key={v} value={v}>
                      {v.charAt(0).toUpperCase() + v.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Miejscowość</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => updateFormData("location", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="executionTerm">Termin realizacji</Label>
              <Input
                id="executionTerm"
                value={formData.executionTerm}
                onChange={(e) => updateFormData("executionTerm", e.target.value)}
              />
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">Opis przedmiotu zamówienia</Label>
              <RichTextEditor
                content={formData.description}
                onChange={(html) => updateFormData("description", html)}
                placeholder="Wprowadź szczegółowy opis..."
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="conditions">Warunki udziału w postępowaniu</Label>
              <RichTextEditor
                content={formData.conditions}
                onChange={(html) => updateFormData("conditions", html)}
                placeholder="Wprowadź warunki udziału (opcjonalnie)..."
              />
            </div>
          </div>
        );
      case 3:
        const totalWeight = formData.criteria.reduce((sum, c) => sum + Number(c.weight), 0);
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Kryteria oceny ofert</Label>
              <Button type="button" variant="outline" size="sm" onClick={addCriterion}>
                <Plus className="w-4 h-4 mr-2" /> Dodaj kryterium
              </Button>
            </div>
            {formData.criteria.map((c, i) => (
              <div key={i} className="flex gap-2 items-center">
                <Input
                  placeholder="Nazwa kryterium"
                  value={c.name}
                  onChange={(e) => updateCriterion(i, "name", e.target.value)}
                  className="flex-1"
                />
                <Input
                  type="number"
                  placeholder="Waga %"
                  value={c.weight}
                  onChange={(e) => updateCriterion(i, "weight", Number(e.target.value))}
                  className="w-24"
                />
                <Button type="button" variant="ghost" size="icon" onClick={() => removeCriterion(i)}>
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            ))}
            <div className={cn("text-sm font-medium", totalWeight !== 100 ? "text-red-500" : "text-green-600")}>
              Suma wag: {totalWeight}% (musi wynosić 100%)
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="publishedAt">Data publikacji</Label>
              <Input
                id="publishedAt"
                type="date"
                value={formData.publishedAt}
                onChange={(e) => updateFormData("publishedAt", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bidsDeadline">Termin składania ofert</Label>
              <Input
                id="bidsDeadline"
                type="date"
                value={formData.bidsDeadline}
                onChange={(e) => updateFormData("bidsDeadline", e.target.value)}
              />
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactPerson">Osoba kontaktowa</Label>
                <Input
                  id="contactPerson"
                  value={formData.contactPerson}
                  onChange={(e) => updateFormData("contactPerson", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Email kontaktowy</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => updateFormData("contactEmail", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPhone">Telefon (opcjonalnie)</Label>
                <Input
                  id="contactPhone"
                  value={formData.contactPhone}
                  onChange={(e) => updateFormData("contactPhone", e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2 mt-4">
              <Label htmlFor="submissionMethod">Sposób składania ofert</Label>
              <Textarea
                id="submissionMethod"
                value={formData.submissionMethod}
                onChange={(e) => updateFormData("submissionMethod", e.target.value)}
                placeholder="Np. poprzez platformę, mailowo..."
              />
            </div>
            <div className="mt-4">
              <Label className="mb-2 block">Załączniki (opcjonalnie)</Label>
              <FileDropzone
                onFilesChange={handleFilesChange}
                existingFiles={uploadedFiles}
                maxFiles={10}
              />
            </div>
          </div>
        );
      case 6:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="font-semibold">Numer:</span> {formData.procedureNumber}</div>
              <div><span className="font-semibold">Tytuł:</span> {formData.title}</div>
              <div><span className="font-semibold">Rodzaj:</span> {formData.orderType}</div>
              <div><span className="font-semibold">Data publikacji:</span> {formData.publishedAt}</div>
              <div><span className="font-semibold">Termin ofert:</span> {formData.bidsDeadline}</div>
              <div><span className="font-semibold">Osoba kontaktowa:</span> {formData.contactPerson}</div>
              <div><span className="font-semibold">Email:</span> {formData.contactEmail}</div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Kryteria oceny:</h4>
              <ul className="list-disc pl-5">
                {formData.criteria.map((c, i) => (
                  <li key={i}>{c.name} - {c.weight}%</li>
                ))}
              </ul>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-navy-900">Nowe ogłoszenie</h1>

      {/* Progress Bar */}
      <div className="flex justify-between items-center mb-8 relative">
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -z-10 -translate-y-1/2"></div>
        <div
          className="absolute top-1/2 left-0 h-1 bg-navy-600 -z-10 -translate-y-1/2 transition-all duration-300"
          style={{ width: `${(step / (STEPS.length - 1)) * 100}%` }}
        ></div>
        {STEPS.map((s, i) => (
          <div key={i} className="flex flex-col items-center space-y-2">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors",
              i <= step ? "bg-navy-600 border-navy-600 text-white" : "bg-white border-gray-300 text-gray-400"
            )}>
              {i + 1}
            </div>
            <span className={cn(
              "text-xs hidden md:block",
              i <= step ? "text-navy-900 font-medium" : "text-gray-400"
            )}>
              {s}
            </span>
          </div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{STEPS[step]}</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div role="alert" className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}
          {renderStep()}
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-6">
          <Button
            variant="outline"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0 || isSubmitting}
          >
            Wstecz
          </Button>

          {step < STEPS.length - 1 ? (
            <Button
              className="bg-navy-800 hover:bg-navy-900"
              onClick={goToNextStep}
              disabled={isSubmitting}
            >
              Dalej
            </Button>
          ) : (
            <div className="space-x-4">
              <Button variant="secondary" onClick={() => handleSubmit("DRAFT")} disabled={isSubmitting}>
                Zapisz jako szkic
              </Button>
              <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleSubmit("PUBLISHED")} disabled={isSubmitting}>
                Opublikuj ogłoszenie
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
