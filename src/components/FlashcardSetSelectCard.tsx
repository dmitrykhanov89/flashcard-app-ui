import { Link } from "react-router-dom";
import { Box, Typography } from "@mui/material";

type FlashcardSetSelectCardProps = {
    id: number;
    name: string;
    cardsCount?: number;
    ownerName?: string;
    imageUrl?: string; // добавим возможность передавать картинку
};

export const FlashcardSetSelectCard = ({id, name, cardsCount, ownerName, imageUrl,}: FlashcardSetSelectCardProps) => {
    return (
        <Link to={`/flashcard-set/${id}`} style={{ textDecoration: "none" }}>
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    borderRadius: 2,
                    overflow: "hidden",
                    width: 300,
                    cursor: "pointer",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    p: 1,
                    "&:hover": { bgcolor: "#f5f5f5" },
                }}
            >
                {/* Слева — картинка/иконка */}
                <Box
                    component="div"
                    sx={{
                        width: 64,
                        height: 64,
                        flexShrink: 0,
                        borderRadius: 1,
                        bgcolor: "#e0e0e0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mr: 2,
                        overflow: "hidden",
                    }}
                >
                    {imageUrl ? (
                        <img src={imageUrl} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                        <Typography variant="h5" color="text.secondary">
                            🧾
                        </Typography>
                    )}
                </Box>

                {/* Справа — текст */}
                <Box component="div" sx={{ display: "flex", flexDirection: "column", color: "black" }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                        {name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                        {cardsCount ?? 0} cards • {ownerName ?? "Unknown"}
                    </Typography>
                </Box>
            </Box>
        </Link>
    );
};
