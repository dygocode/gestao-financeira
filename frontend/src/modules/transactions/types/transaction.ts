import type { PaginatedResponse } from "~/shared/types/api";
export type TransactionType="INCOME"|"EXPENSE";
export interface Transaction{ id:number;name:string;description:string|null;amount:string;categoryId:number;date:string;type:TransactionType;userId:number;createdAt:string;updatedAt:string;category:{id:number;name:string}; }
export interface TransactionInput{name:string;description?:string|null;amount:string;categoryId:number;date:string;type:TransactionType;}
export interface TransactionFilters{filterType:TransactionType|"";categoryId:string;startDate:string;endDate:string;page:number;limit:number;}
export type TransactionPage=PaginatedResponse<Transaction>;
