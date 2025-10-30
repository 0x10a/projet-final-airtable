/**
 * Composant AttendanceChart - Graphique de présence par cours avec Recharts
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface AttendanceData {
  cours: string;
  taux: number;
  presents: number;
  total: number;
}

interface AttendanceChartProps {
  data: AttendanceData[];
}

export function AttendanceChart({ data }: AttendanceChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Taux de Présence par Cours</CardTitle>
        <CardDescription>
          Analyse des présences pour chaque formation
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            Aucune donnée de présence disponible
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="cours"
                angle={-45}
                textAnchor="end"
                height={100}
                interval={0}
              />
              <YAxis
                label={{ value: 'Taux de présence (%)', angle: -90, position: 'insideLeft' }}
                domain={[0, 100]}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as AttendanceData;
                    return (
                      <div className="bg-background border rounded-lg shadow-lg p-3">
                        <p className="font-semibold">{data.cours}</p>
                        <p className="text-sm text-muted-foreground">
                          Taux : {data.taux.toFixed(1)}%
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {data.presents} présents sur {data.total}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="taux"
                fill="hsl(var(--primary))"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
