import React, { useState, useEffect } from "react";
import { render } from "react-dom";
import { ChakraProvider } from "@chakra-ui/react";
// Use Chakra Ui for create a custom component for display field data in table
import {
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    TableContainer,
    Input,
} from "@chakra-ui/react";
import ReactPaginate from "react-paginate";

// Recommended for icons
import { FaHandPointRight, FaHandPointDown } from "react-icons/fa";
import "./style.css";
interface DataType {
    num: number;
    date: string;
    county: string;
    state: string;
    fips: string;
    cases: number;
    deaths: number;
    updated: number;
    hand: number;
}
export const CovidTable = () => {
    // Control current Page
    const [datas, setDatas] = useState([]);
    const [tableData, setTableData] = useState<any[]>([]);
    const [detailNum, setDetailNum] = useState(0);
    const [detailNo, setDetailNo] = useState(0);
    const [detailFlag, setDetailFlag] = useState(false);
    const [value, setValue] = useState("");
    const [saveData, setSaveData] = useState<any[]>([]);
    const [filterData, setFilterData] = useState<any[]>([]);
    const [pageNum, setPageNum] = useState(0);
    const [totalCount, setTotalCount] = useState(0);

    useEffect(() => {
        fetch("https://disease.sh/v3/covid-19/nyt/counties?lastdays=1")
            .then((res) => res.json())
            .then((datas) => {
                setDatas(datas);
                maniplateData(datas);
            });
    }, []);
    const maniplateData = (datas: DataType[]) => {
        if (datas === null) {
            return;
        }
        let temp = datas;
        let stateData: DataType[] = [
            {
                ...datas[0],
                num: 0,
                hand: 1,
            },
        ];
        datas.shift();
        let index = 0;
        datas.forEach((data: DataType) => {
            let offState = 0;
            stateData.forEach((item: DataType) => {
                if (data.state === item.state) {
                    item.deaths += data.deaths;
                    item.cases += data.cases;
                    offState = 1;
                }
            });

            if (offState === 0) {
                stateData.push({
                    ...data,
                    num: index + 1,
                    hand: 1,
                });
                index++;
            }
        });
        let selectData = stateData.slice(0, 20);
        setTableData(selectData);
        setTotalCount(stateData.length / 20);
        setSaveData(stateData);
        setFilterData(stateData);
    };

    //detail view
    const detailView = (state: string, num: number) => {
        let temp = filterData;
        if (detailFlag === true) {
            temp[detailNo].hand = 1;
            temp.splice(detailNo + 1, detailNum);
        }
        temp[num].hand = 2;
        let countyview: DataType[] = [];
        datas.forEach((data: DataType) => {
            if (data.state === state) {
                countyview.push({ ...data, state: data.county, hand: 0 });
            }
        });
        temp.splice(num + 1, 0, ...countyview);
        setDetailNum(countyview.length);
        setDetailNo(num);
        setDetailFlag(true);
        setFilterData([...temp]);
        setTotalCount(temp.length / 20);
        let selectData = temp.slice(20 * pageNum, 20 * (pageNum + 1) - 1);
        setTableData(selectData);
    };
    //detal cancel
    const detailCancel = (state: string, num: number) => {
        let temp = filterData;
        temp[num].hand = 1;
        temp.splice(num + 1, detailNum);
        setFilterData([...temp]);
        setTotalCount(temp.length / 20);
        let selectData = temp.slice(20 * pageNum, 20 * (pageNum + 1) - 1);
        setTableData(selectData);
        setDetailFlag(false);
    };
    //search
    const handleChange = (event: any) => {
        setValue(event.target.value);
        let temp = saveData.filter((data) =>
            data.state.toLowerCase().includes(event.target.value.toLowerCase())
        );
        console.log(temp);
        setTotalCount(temp.length / 20);
        setFilterData([...temp]);
        let selectData = temp.slice(0, 20);
        setTableData(selectData);
    };
    const handlePageChange = (data: any) => {
        setPageNum(data.selected);
        let selectData = filterData.slice(
            20 * data.selected,
            20 * (data.selected + 1) - 1
        );
        setTableData(selectData);
    };
    return (
        <React.Fragment>
            <TableContainer className="tableContainer">
                <Input
                    className="searchStyle"
                    variant="flushed"
                    placeholder="Search"
                    onChange={handleChange}
                />
                <Table size="lg">
                    <Thead>
                        <Tr>
                            <Th>
                                <FaHandPointRight className="iconColor" />
                            </Th>
                            <Th>State</Th>
                            <Th>Death</Th>
                            <Th>Cases</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {tableData?.map((data: any, index: number) => (
                            <Tr key={index}>
                                <Td>
                                    {data.hand === 2 ? (
                                        <FaHandPointDown
                                            className="iconColor"
                                            onClick={() =>
                                                detailCancel(
                                                    data.state,
                                                    data.num
                                                )
                                            }
                                        />
                                    ) : (
                                        <FaHandPointRight
                                            className="iconColor"
                                            style={
                                                data.hand === 0
                                                    ? { display: "none" }
                                                    : {}
                                            }
                                            onClick={() =>
                                                detailView(data.state, data.num)
                                            }
                                        />
                                    )}
                                </Td>
                                <Td>{data.state}</Td>
                                <Td>{data.deaths}</Td>
                                <Td>{data.cases}</Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
            </TableContainer>
            <ReactPaginate
                className="paginationStyle"
                breakLabel="..."
                nextLabel="next >"
                onPageChange={handlePageChange}
                pageRangeDisplayed={3}
                pageCount={totalCount}
                previousLabel="< previous"
                containerClassName="pagination justify-content-center"
                pageClassName="page-item"
                pageLinkClassName="page-link"
                previousClassName="page-item"
                previousLinkClassName="page-link"
                nextClassName="page-item"
                nextLinkClassName="page-link"
                activeClassName="active"
                breakClassName="page-item"
                breakLinkClassName="page-link"
            />
        </React.Fragment>
    );
};
