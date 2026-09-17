"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function ResolvePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [resolveData, setResolveData] = useState({
    contractorName: "",
    contractorNip: "",
    price: "",
    justification: ""
  });

  const [cancelData, setCancelData] = useState({
    cancellationReason: ""
  });

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // POST to /api/announcements/[id]/resolve
      const res = await fetch(`/api/announcements/${id}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "RESOLVE", ...resolveData }),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => router.push("/panel/ogloszenia"), 2000);
      } else {
        setError("Wystąpił błąd podczas zapisywania rozstrzygnięcia.");
      }
    } catch (err) {
      setError("Wystąpił błąd podczas zapisywania rozstrzygnięcia.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/announcements/${id}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "CANCEL", ...cancelData }),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => router.push("/panel/ogloszenia"), 2000);
      } else {
        setError("Wystąpił błąd podczas unieważniania postępowania.");
      }
    } catch (err) {
      setError("Wystąpił błąd podczas unieważniania postępowania.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto mt-10">
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Sukces!</AlertTitle>
          <AlertDescription className="text-green-700">
            Operacja zakończona pomyślnie. Za chwilę zostaniesz przekierowany do listy ogłoszeń.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Zakończenie postępowania</h1>
        <p className="text-gray-500 mt-1">Wybierz, czy chcesz rozstrzygnąć, czy unieważnić postępowanie.</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Błąd</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="resolve" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="resolve">Wybór wykonawcy</TabsTrigger>
          <TabsTrigger value="cancel">Unieważnienie</TabsTrigger>
        </TabsList>

        <TabsContent value="resolve">
          <Card>
            <CardHeader>
              <CardTitle>Rozstrzygnięcie postępowania</CardTitle>
              <CardDescription>Wprowadź dane wybranego wykonawcy.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleResolve} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="contractorName">Nazwa wykonawcy *</Label>
                  <Input
                    id="contractorName"
                    required
                    value={resolveData.contractorName}
                    onChange={(e) => setResolveData({...resolveData, contractorName: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contractorNip">NIP wykonawcy (opcjonalnie)</Label>
                    <Input
                      id="contractorNip"
                      value={resolveData.contractorNip}
                      onChange={(e) => setResolveData({...resolveData, contractorNip: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Cena brutto oferty (PLN) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      required
                      value={resolveData.price}
                      onChange={(e) => setResolveData({...resolveData, price: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="justification">Uzasadnienie wyboru *</Label>
                  <Textarea
                    id="justification"
                    rows={4}
                    required
                    value={resolveData.justification}
                    onChange={(e) => setResolveData({...resolveData, justification: e.target.value})}
                    placeholder="Krótkie uzasadnienie wyboru oferty..."
                  />
                </div>

                <div className="pt-4 flex justify-end">
                  <Button type="submit" disabled={loading} className="bg-navy-800 hover:bg-navy-900">
                    {loading ? "Zapisywanie..." : "Rozstrzygnij postępowanie"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cancel">
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Unieważnienie postępowania</CardTitle>
              <CardDescription>Podaj powód unieważnienia postępowania.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCancel} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cancellationReason">Powód unieważnienia *</Label>
                  <Textarea
                    id="cancellationReason"
                    rows={5}
                    required
                    value={cancelData.cancellationReason}
                    onChange={(e) => setCancelData({...cancelData, cancellationReason: e.target.value})}
                    placeholder="Opisz dokładnie, dlaczego postępowanie zostaje unieważnione..."
                  />
                </div>

                <div className="pt-4 flex justify-end">
                  <Button type="submit" variant="destructive" disabled={loading}>
                    {loading ? "Zapisywanie..." : "Unieważnij postępowanie"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
