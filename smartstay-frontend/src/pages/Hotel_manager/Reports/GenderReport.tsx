import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Chart, registerables } from "chart.js";
import { useAuthStore } from "../../../store";

Chart.register(...registerables);

interface GenderStat {
    gender: string;
    count: number;
}

export default function GenderReport() {
    const user = useAuthStore((s) => s.user);
    const chartRef = useRef<HTMLCanvasElement>(null);
    const [genderStats, setGenderStats] = useState<GenderStat[]>([]);

    const [stats, setStats] = useState([]);

    useEffect(() => {
        fetchData();
    }, [user?.hotelId]);


    async function fetchData() {
        const res = await axios.get<GenderStat[]>(
            `https://localhost:7168/api/reports/${user?.hotelId}/gender`
        );
        setGenderStats(res.data);

        if (chartRef.current) {
            new Chart(chartRef.current, {
                type: "bar",
                data: {
                    labels: res.data.map((g: any) => g.gender),
                    datasets: [
                        {
                            label: "Guests",
                            data: res.data.map((g: any) => g.count),
                        },
                    ],
                },
                options: {
                    indexAxis: "y",
                },
            });
        }
    }

    return (
        <div className="report-page">
            <h2>🧑 Gender Overview</h2>
            <Link to="/manager/report" className="back-btn">← Back to Reports</Link>
            <div className="kpi-container">
                <div className="kpi-card">
                    <h4>Total Guests</h4>
                    <p>{totalGuests}</p>
                </div>

                <div className="kpi-card">
                    <h4>Male</h4>
                    <p>{malePercent}%</p>
                </div>

                <div className="kpi-card">
                    <h4>Female</h4>
                    <p>{femalePercent}%</p>
                </div>

                <div className="kpi-card">
                    <h4>Other</h4>
                    <p>{otherPercent}%</p>
                </div>
            </div>

            <canvas ref={chartRef} height={150}></canvas>
        </div>
    );
}
