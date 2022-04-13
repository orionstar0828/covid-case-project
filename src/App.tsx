import React from "react";
import { ChakraProvider } from "@chakra-ui/react";
import { CovidTable } from "./views/covidTable";
import "bootstrap/dist/css/bootstrap.min.css";
function App() {
    return (
        <ChakraProvider>
            <CovidTable />
        </ChakraProvider>
    );
}

export default App;
