"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Loader2, Save, X } from "lucide-react";
import { VOIVODESHIPS } from "@/lib/utils";

export default function EditAnnouncementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        const res = await fetch(`/api/announcements/${id}`);
        if (!res.ok) throw new Error("Nie udało się pobrać ogłoszenia");
        const data = await res.json();
        // Set defaults if some fields are null
        setFormData({
          title: data.title || "",
          procedureNumber: data.procedureNumber || "",
          orderType: data.orderType || "SUPPLIES",
          description: data.description || "",
          conditions: data.conditions || "",
          criteria: data.criteria || [],
          status: data.status,
          contactPerson: data.contactPerson || "",
          bidsDeadline: data.bidsDeadline ? new Date(new Date(data.bidsDeadline).getTime() - new Date(data.bidsDeadline).getTimezoneOffset() * 60000).toISOString().slice(0, 16) : "",
          executionTerm: data.executionTerm || "",
          location: data.location || "",
          voivodeship: data.voivodeship || "",
          submissionMethod: data.submissionMethod || "",
          contactEmail: data.contactEmail || "",
          contactPhone: data.contactPhone || "",
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncement();
  }, [id]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (publish = false) => {
    setSaving(true);
    try {
      const payload = { ...formData, ...(publish ? { status: "PUBLISHED" } : {}) };
      if (!publish) delete payload.status;
      if (payload.bidsDeadline) {
        payload.bidsDeadline = new Date(payload.bidsDeadline).toISOString();
      } else {
        payload.bidsDeadline = null;
      }

      const res = await fetch(`/api/announcements/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Błąd zapisu ogłoszenia");
      router.push("/panel/ogloszenia");
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-[#145447]" /></div>;
  if (error && !formData.title) return <div role="alert" className="text-red-500 p-4">{error}</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="flex flex-wrap gap-4 justify-between items-center">
        <h1 className="text-2xl font-bold text-[#145447]">Edycja ogłoszenia</h1>
        <div className="gap-2 flex flex-wrap">
          {formData.status === "DRAFT" && <Button disabled={saving} onClick={() => handleSave(true)}>Opublikuj</Button>}
          <Button variant="outline" onClick={() => router.push("/panel/ogloszenia")} disabled={saving}>
            <X className="w-4 h-4 mr-2" /> Anuluj
          </Button>
          <Button className="bg-[#145447] hover:bg-[#0D4036] text-white" onClick={() => handleSave()} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Zapisz zmiany
          </Button>
        </div>
      </div>

      {error && <p role="alert" className="text-red-700">{error}</p>}
      <Tabs defaultValue="podstawowe" className="w-full">
        <TabsList className="max-w-full overflow-x-auto justify-start border-b rounded-none h-auto bg-transparent p-0 mb-6 space-x-6">
          <TabsTrigger value="podstawowe" className="data-[state=active]:border-b-2 data-[state=active]:border-[#145447] rounded-none px-0 py-2">Dane podstawowe</TabsTrigger>
          <TabsTrigger value="opis" className="data-[state=active]:border-b-2 data-[state=active]:border-[#145447] rounded-none px-0 py-2">Opis</TabsTrigger>
          <TabsTrigger value="warunki" className="data-[state=active]:border-b-2 data-[state=active]:border-[#145447] rounded-none px-0 py-2">Warunki</TabsTrigger>
          <TabsTrigger value="kryteria" className="data-[state=active]:border-b-2 data-[state=active]:border-[#145447] rounded-none px-0 py-2">Kryteria oceny</TabsTrigger>
          <TabsTrigger value="terminy" className="data-[state=active]:border-b-2 data-[state=active]:border-[#145447] rounded-none px-0 py-2">Terminy i kontakt</TabsTrigger>
        </TabsList>

        <Card>
          <CardContent className="p-6">
            <TabsContent value="podstawowe" className="mt-0 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-field-1">Tytuł zamówienia</Label>
                <Input id="edit-field-1" value={formData.title} onChange={e => handleInputChange("title", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-field-2">Numer postępowania</Label>
                <Input id="edit-field-2" value={formData.procedureNumber} onChange={e => handleInputChange("procedureNumber", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Rodzaj zamówienia</Label>
                <Select value={formData.orderType} onValueChange={v => handleInputChange("orderType", v)}>
                  <SelectTrigger aria-label="Wybierz rodzaj lub województwo"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SUPPLIES">Dostawy</SelectItem>
                    <SelectItem value="SERVICES">Usługi</SelectItem>
                    <SelectItem value="CONSTRUCTION">Roboty budowlane</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="opis" className="mt-0 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-field-3">Krótki opis</Label>
                <Textarea id="edit-field-3" rows={6} value={formData.description} onChange={e => handleInputChange("description", e.target.value)} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Województwo</Label>
                  <Select value={formData.voivodeship} onValueChange={v => handleInputChange("voivodeship", v)}>
                    <SelectTrigger aria-label="Wybierz rodzaj lub województwo"><SelectValue placeholder="Wybierz..." /></SelectTrigger>
                    <SelectContent>
                      {VOIVODESHIPS.map((v: string) => (
                        <SelectItem key={v} value={v}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-field-4">Miejsce realizacji (dokładne)</Label>
                  <Input id="edit-field-4" value={formData.location} onChange={e => handleInputChange("location", e.target.value)} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="warunki" className="mt-0 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-field-5">Warunki udziału w postępowaniu</Label>
                <Textarea id="edit-field-5" rows={6} value={formData.conditions} onChange={e => handleInputChange("conditions", e.target.value)} />
              </div>
            </TabsContent>

            <TabsContent value="kryteria" className="mt-0 space-y-4">
              <div className="space-y-2">
                <Label>Kryteria oceny ofert i ich waga</Label>
                {formData.criteria?.map((criterion: { name: string; weight: number }, index: number) => <div className="flex gap-2" key={index}>
                  <Input aria-label={`Nazwa kryterium ${index + 1}`} value={criterion.name} onChange={e => setFormData((prev: any) => ({ ...prev, criteria: prev.criteria.map((c: any, i: number) => i === index ? { ...c, name: e.target.value } : c) }))} />
                  <Input aria-label={`Waga kryterium ${index + 1}`} type="number" min={1} max={100} value={criterion.weight} onChange={e => setFormData((prev: any) => ({ ...prev, criteria: prev.criteria.map((c: any, i: number) => i === index ? { ...c, weight: Number(e.target.value) } : c) }))} />
                  <Button variant="outline" aria-label={`Usuń kryterium ${index + 1}`} onClick={() => setFormData((prev: any) => ({ ...prev, criteria: prev.criteria.filter((_: any, i: number) => i !== index) }))}>Usuń</Button>
                </div>)}
                <Button variant="outline" onClick={() => setFormData((prev: any) => ({ ...prev, criteria: [...prev.criteria, { name: "", weight: 1 }] }))}>Dodaj kryterium</Button>
              </div>
            </TabsContent>

            <TabsContent value="terminy" className="mt-0 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-field-6">Termin składania ofert</Label>
                  <Input id="edit-field-6" type="datetime-local" value={formData.bidsDeadline} onChange={e => handleInputChange("bidsDeadline", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-field-7">Termin realizacji zamówienia</Label>
                  <Input id="edit-field-7" value={formData.executionTerm} onChange={e => handleInputChange("executionTerm", e.target.value)} placeholder="np. do 31.12.2023 r." />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="edit-field-8">Sposób składania ofert</Label>
                  <Textarea id="edit-field-8" rows={2} value={formData.submissionMethod} onChange={e => handleInputChange("submissionMethod", e.target.value)} placeholder="np. elektronicznie przez system, mailem, papierowo..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-field-9">Email do kontaktu</Label>
                  <Input id="edit-field-9" type="email" value={formData.contactEmail} onChange={e => handleInputChange("contactEmail", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-field-10">Telefon do kontaktu</Label>
                  <Input id="edit-field-10" value={formData.contactPhone} onChange={e => handleInputChange("contactPhone", e.target.value)} />
                </div>
              </div>
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
}
