import React from "react";
import { Card, Text } from "react-native-paper";

interface Game {
    name: string;
    description: string;
}

export default function GameCard({ game }: { game: Game }) {

    return (
        <Card>
            <Card.Content>
                <Text>{game.name}</Text>
                <Text>{game.description}</Text>
            </Card.Content>
        </Card>
    );
}